export default function IconRole({ role }) {
  if (role === "admin") {
    return <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>;
  } else if (role === "provider") {
    return (
      <i
        className="fa fa-user-graduate"
        aria-hidden="true"
        title="Provider"
      ></i>
    );
  } else if (role === "analyst") {
    return (
      <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
    );
  } else if (role === "supplier") {
    return (
      <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
    );
  } else {
    return <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>;
  }
}
