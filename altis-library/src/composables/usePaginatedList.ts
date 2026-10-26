import { computed, onMounted, ref, watch } from 'vue';

import type { PageResponse } from '@/types/paginations';

export type ListLoader<T> = (
  search: string,
  page: number,
  size: number,
) => Promise<PageResponse<T>>;

export function usePaginatedList<T>(
  loadPageData: ListLoader<T>,
  options: {
    pageSize?: number;
    initialSearch?: string;
  } = {},
) {
  const pageSize = options.pageSize ?? 10;

  const items = ref<T[]>([]);
  const search = ref(options.initialSearch ?? '');
  const currentPage = ref(1);
  const totalElements = ref(0);
  const loading = ref(false);

  const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / pageSize)));

  let requestId = 0;

  async function loadPage() {
    const currentRequest = ++requestId;
    loading.value = true;

    try {
      const response = await loadPageData(search.value.trim(), currentPage.value, pageSize);

      if (currentRequest !== requestId) return response;

      items.value = response.content;
      totalElements.value = response.totalElements;

      return response;
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  }

  function changePage(page: number) {
    if (page === currentPage.value) return;

    currentPage.value = page;
    void loadPage();
  }

  watch(search, () => {
    currentPage.value = 1;
    void loadPage();
  });

  onMounted(() => {
    void loadPage();
  });

  return {
    items,
    search,
    currentPage,
    totalElements,
    loading,
    totalPages,
    pageSize,
    loadPage,
    changePage,
  };
}
