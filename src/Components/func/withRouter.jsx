import { useLocation, useNavigate } from "react-router-dom";

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    const { key, ...rest } = location;
    return <Component {...props} navigate={navigate} {...rest} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter;
