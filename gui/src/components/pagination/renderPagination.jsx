import { Pagination } from "react-bootstrap";

export default function RenderPagination({ setSearchParams, paginationInfos }) {
  if (
    paginationInfos === undefined ||
    paginationInfos.totalPages === undefined ||
    paginationInfos.limit === undefined ||
    paginationInfos.prevPage === undefined ||
    paginationInfos.nextPage === undefined ||
    paginationInfos.hasPrevPage === undefined ||
    paginationInfos.hasNextPage === undefined ||
    paginationInfos.page === undefined
  )
    return "";

  const pageNum = paginationInfos.page;
  const totalPages = paginationInfos.totalPages;
  const pageLimit = paginationInfos.limit;
  const prevPage = paginationInfos.prevPage;
  const nextPage = paginationInfos.nextPage;
  const hasNext = paginationInfos.hasNextPage;
  const hasPrev = paginationInfos.hasPrevPage;
  const prevEllipsis = parseInt(pageNum, 10) - 2 > 0;
  const nextEllipsis = parseInt(pageNum, 10) + 2 < totalPages;

  return (
    <div style={{ display: "inline-flex", width: 100 + "%" }}>
      <Pagination
        style={{
          alignSelf: "center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Pagination.First
          disabled={pageNum === 1}
          onClick={() => setSearchParams({ page: 1, limit: pageLimit })}
        />
        <Pagination.Prev
          disabled={!hasPrev}
          onClick={() => setSearchParams({ page: prevPage, limit: pageLimit })}
        />
        {prevEllipsis && <Pagination.Ellipsis />}
        {parseInt(pageNum, 10) - 1 > 0 && (
          <Pagination.Item
            onClick={() =>
              setSearchParams({
                page: parseInt(pageNum, 10) - 1,
                limit: pageLimit,
              })
            }
          >
            {parseInt(pageNum, 10) - 1}
          </Pagination.Item>
        )}
        <Pagination.Item>
          <b>{pageNum}</b>
        </Pagination.Item>
        {parseInt(pageNum, 10) + 1 <= totalPages && (
          <Pagination.Item
            onClick={() =>
              setSearchParams({
                page: parseInt(pageNum, 10) + 1,
                limit: pageLimit,
              })
            }
          >
            {parseInt(pageNum, 10) + 1}
          </Pagination.Item>
        )}
        {nextEllipsis && <Pagination.Ellipsis />}

        <Pagination.Next
          disabled={!hasNext}
          onClick={() => setSearchParams({ page: nextPage, limit: pageLimit })}
        />
        <Pagination.Last
          disabled={pageNum === totalPages}
          onClick={() =>
            setSearchParams({ page: totalPages, limit: pageLimit })
          }
        />
      </Pagination>
    </div>
  );
}
