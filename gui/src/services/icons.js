import { library, dom } from "@fortawesome/fontawesome-svg-core";

import {
  faPlusCircle,
  faEye,
  faPencilAlt,
  faCopy,
  faTimes,
  faBars,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
  faCheck,
  faTruck,
  faShareFromSquare,
  faCircle,
  faBan,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
export default function LoadIcons() {
  library.add(
    faPlusCircle,
    faEye,
    faPencilAlt,
    faCopy,
    faTimes,
    faBars,
    faUserTie,
    faUserGraduate,
    faUserCog,
    faUserTag,
    faUser,
    faCheck,
    faTimes,
    faBars,
    faUserTie,
    faUserGraduate,
    faUserCog,
    faUserTag,
    faUser,
    faCheck,
    faTruck,
    faShareFromSquare,
    faCircle,
    faBan,
    faMagnifyingGlass
  );
  dom.watch();
}
