const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const importsToAdd = `
import B2BDashboardPage from "./pages/b2b/B2BDashboardPage";
import AdminB2BOrdersPage from "./pages/admin/AdminB2BOrdersPage";
`;

if (!content.includes('B2BDashboardPage')) {
  content = content.replace(
    /import CheckoutSuccessPage from "\.\/pages\/orders\/CheckoutSuccessPage";/,
    `import CheckoutSuccessPage from "./pages/orders/CheckoutSuccessPage";\n${importsToAdd}`
  );
}

const b2bRoutes = `
          <Route
            path="/b2b/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Enterprise"]}>
                <B2BDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/b2b-orders"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <AdminB2BOrdersPage />
              </ProtectedRoute>
            }
          />
`;

if (!content.includes('/b2b/dashboard')) {
  content = content.replace(
    /<Route[\s\n]*path="\/admin\/orders"/,
    `${b2bRoutes}\n          <Route path="/admin/orders"`
  );
  fs.writeFileSync(appPath, content);
  console.log("Updated App.jsx with B2B routes");
} else {
  console.log("App.jsx already has B2B routes");
}
