import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from "./app";
import Home from './home/home';
import Login from './login/login';
import Register from './register/register';
import UserList from './user/user-list';
import UserAdd from './user/user-add';
import UserEdit from './user/user-edit';
import RoleList from './role/role-list';
import RoleAdd from './role/role-add';
import RoleEdit from './role/role-edit';
import ResourceList from './resource/resource-list';
import ResourceAdd from './resource/resource-add';
import ResourceEdit from './resource/resource-edit';
import AssignResourceToRole from './resource/assign-resouurce';
import PermissionList from './permission/permission-list';
import PermissionAdd from './permission/permission-add';
import PermissionEdit from './permission/permission-edit';
import ProviderTypeList from './provider-type/provider-type-list';
import ProviderTypeAdd from './provider-type/provider-type-add';
import ProviderTypeEdit from './provider-type/provider-type-edit';
import ContentProviderList from './content-provider/content-provider-list';
import ContentProviderAdd from './content-provider/content-provider-add';
import ContentProviderEdit from './content-provider/content-provider-edit';
import ExamList from './exam/exam-list';
import ExamAdd from './exam/exam-add';
import ExamEdit from './exam/exam-edit';
import CategoryList from './category/category-list';
import CategoryAdd from './category/category-add';
import CategoryEdit from './category/category-edit';
import QSetList from './q-set/q-set-list';
import QSetAdd from './q-set/q-set-add';
import QSetEdit from './q-set/q-set-edit';
import QuestionList from './question/question-list';
import QuestionAdd from './question/question-add';
import QuestionEdit from './question/question-edit';
import TagList from './tag/tag-list';
import TagAdd from './tag/tag-add';
import TagEdit from './tag/tag-edit';
import Error from './error/error';
import UploadQuestions from './question/upload';
import PdfQnATransformer from './question/extract-questions';
import AssignUsersToRole from './role/assign-users';


export default function AppRoutes() {
  const router = createBrowserRouter([
    {
      element: <App />,
      children: [
        { path: '', element: <Login /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'home', element: <Home /> },
        { path: 'users', element: <UserList /> },
        { path: 'users/add', element: <UserAdd /> },
        { path: 'users/edit/:id', element: <UserEdit /> },
        { path: 'roles', element: <RoleList /> },
        { path: 'roles/add', element: <RoleAdd /> },
        { path: 'roles/edit/:id', element: <RoleEdit /> },
        { path: 'roles/assignResource/:roleid', element: <AssignResourceToRole /> },
        { path: 'assignUsers/:roleid', element: <AssignUsersToRole /> },
        { path: 'resources', element: <ResourceList /> },
        { path: 'resources/add', element: <ResourceAdd /> },
        { path: 'resources/edit/:id', element: <ResourceEdit /> },

        { path: 'permissions', element: <PermissionList /> },
        { path: 'permissions/add', element: <PermissionAdd /> },
        { path: 'permissions/edit/:id', element: <PermissionEdit /> },
        { path: 'providerTypes', element: <ProviderTypeList /> },
        { path: 'providerTypes/add', element: <ProviderTypeAdd /> },
        { path: 'providerTypes/edit/:id', element: <ProviderTypeEdit /> },
        { path: 'contentProviders', element: <ContentProviderList /> },
        { path: 'contentProviders/add', element: <ContentProviderAdd /> },
        { path: 'contentProviders/edit/:id', element: <ContentProviderEdit /> },
        { path: 'exams', element: <ExamList /> },
        { path: 'exams/add', element: <ExamAdd /> },
        { path: 'exams/edit/:id', element: <ExamEdit /> },
        { path: 'categories', element: <CategoryList /> },
        { path: 'categories/add', element: <CategoryAdd /> },
        { path: 'categories/edit/:id', element: <CategoryEdit /> },
        { path: 'qSets', element: <QSetList /> },
        { path: 'qSets/add', element: <QSetAdd /> },
        { path: 'qSets/edit/:id', element: <QSetEdit /> },
        { path: 'questions', element: <QuestionList /> },
        { path: 'questions/add', element: <QuestionAdd /> },
        { path: 'questions/edit/:id', element: <QuestionEdit /> },
        { path: 'upload', element: <UploadQuestions /> },
        { path: 'q-extract', element: <PdfQnATransformer /> },
        { path: 'tags', element: <TagList /> },
        { path: 'tags/add', element: <TagAdd /> },
        { path: 'tags/edit/:id', element: <TagEdit /> },
        { path: 'error', element: <Error /> },
        { path: '*', element: <Error /> }
      ]
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}
