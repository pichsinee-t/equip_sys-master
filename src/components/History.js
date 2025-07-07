import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const theme = createTheme({
  typography: {
    fontFamily: "Kanit, Arial, sans-serif",
  },
});

function History() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [filterType, setFilterType] = useState("bring");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const firstname = localStorage.getItem("firstname");
  const lastname = localStorage.getItem("lastname");
  const userID = localStorage.getItem("userID");

  // โหลดประวัติการเบิก-ยืม
  const loadHistory = () => {
    fetch(`http://localhost:4000/api/history?userID=${userID}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => {
        setAlertMsg("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setAlertSeverity("error");
        setOpen(true);
      });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const pic = localStorage.getItem("profilePic");
      if (pic) setProfilePic(pic);
    } else {
      setProfilePic(null);
    }
  }, [isLoggedIn]);

  const handleUserIconClick = (event) => {
    if (!isLoggedIn) navigate("/login");
    else setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    handleMenuClose();
    navigate("/login");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  // ฟิลเตอร์ข้อมูลตามประเภท
  const filteredHistory = history.filter((item) => {
    if (filterType === "bring") return item.type === "เบิก-จ่าย";
    if (filterType === "borrow") return item.type === "ยืม-คืน";
    return true;
  });

  // เปิด Dialog รายละเอียด
  const handleDetailOpen = (item) => {
    setSelectedDetail(item);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedDetail(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        {/* Header */}
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }}>
              <Box
                component="img"
                src={logo}
                alt="logo"
                sx={{ width: 52, height: 52, objectFit: "contain" }}
              />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ประวัติการเบิก-ยืมอุปกรณ์
            </Typography>
            {isLoggedIn && (
              <Typography sx={{ mr: 1 }}>
                {firstname} {lastname}
              </Typography>
            )}
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleUserIconClick}
              sx={{ p: 0, ml: 1 }}
            >
              {isLoggedIn && profilePic ? (
                <Avatar src={profilePic} sx={{ width: 36, height: 36 }} />
              ) : (
                <AccountCircleIcon sx={{ width: 36, height: 36 }} />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfile}>จัดการข้อมูลผู้ใช้</MenuItem>
              <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ maxWidth: 1000, mx: "auto", mt: 6, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            ประวัติการเบิก-ยืมอุปกรณ์ของคุณ
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant={filterType === "bring" ? "contained" : "outlined"}
              onClick={() => setFilterType("bring")}
            >
              เบิก-จ่าย
            </Button>
            <Button
              variant={filterType === "borrow" ? "contained" : "outlined"}
              onClick={() => setFilterType("borrow")}
            >
              ยืม-คืน
            </Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>วันที่ทำรายการ</TableCell>
                  <TableCell>ชื่ออุปกรณ์</TableCell>
                  <TableCell>จำนวน</TableCell>
                  <TableCell>วันรับของ</TableCell>
                  <TableCell>วันรับคืน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>รายละเอียด</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.equipmentName}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.receiveDate || "-"}</TableCell>
                      <TableCell>{item.returnDate || "-"}</TableCell>
                      <TableCell>{item.status || "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDetailOpen(item)}
                        >
                          รายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Dialog แสดงรายละเอียด */}
        <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="sm" fullWidth>
          <DialogTitle>รายละเอียดรายการ</DialogTitle>
          <DialogContent dividers>
            {selectedDetail && (
              <Box>
                <Typography>
                  <b>วันที่ทำรายการ:</b> {selectedDetail.date}
                </Typography>
                <Typography>
                  <b>ประเภท:</b> {selectedDetail.type}
                </Typography>
                <Typography>
                  <b>ชื่ออุปกรณ์:</b> {selectedDetail.equipmentName}
                </Typography>
                <Typography>
                  <b>จำนวน:</b> {selectedDetail.amount}
                </Typography>
                <Typography>
                  <b>วันรับของ:</b> {selectedDetail.receiveDate || "-"}
                </Typography>
                <Typography>
                  <b>วันรับคืน:</b> {selectedDetail.returnDate || "-"}
                </Typography>
                <Typography>
                  <b>สถานะ:</b> {selectedDetail.status || "-"}
                </Typography>
                {selectedDetail.imageFile && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography>
                      <b>รูปบัตรประจำตัว:</b>
                    </Typography>
                    <Box
                      component="img"
                      src={selectedDetail.imageFile}
                      alt="idcard"
                      sx={{ width: 200, mt: 1, borderRadius: 1, border: "1px solid #ccc" }}
                    />
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailClose} variant="contained">
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={open}
          autoHideDuration={2500}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={alertSeverity} sx={{ width: "100%" }}>
            {alertMsg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default History;