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
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const theme = createTheme({
  typography: {
    fontFamily: "Kanit, Arial, sans-serif",
  },
});

function EditBring() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [requestAmounts, setRequestAmounts] = useState({});
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const roleID = Number(localStorage.getItem("roleID") || 0);
  const isAdmin = roleID === 2;

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const firstname = localStorage.getItem("firstname");
  const lastname = localStorage.getItem("lastname");

  const [newEquipName, setNewEquipName] = useState("");
  const [newEquipAmount, setNewEquipAmount] = useState("");
  const [editingEquipments, setEditingEquipments] = useState({});

  const loadEquipment = () => {
    fetch("http://localhost:4000/api/equipment")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((item) => item.typeID === 1);
        setEquipment(filtered);
        if (isAdmin) {
          const editState = {};
          filtered.forEach((item) => {
            editState[item.equipmentID] = {
              equipmentName: item.equipmentName,
              amount: item.amount,
            };
          });
          setEditingEquipments(editState);
        }
      })
      .catch(() => setEquipment([]));
  };

  useEffect(() => {
    loadEquipment();
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

  const handleEditChange = (equipmentID, field, value) => {
    setEditingEquipments((prev) => ({
      ...prev,
      [equipmentID]: {
        ...prev[equipmentID],
        [field]: field === "amount" ? Number(value) : value,
      },
    }));
  };

  const handleSaveEdit = (equipmentID) => {
    const edited = editingEquipments[equipmentID];
    if (!edited.equipmentName || edited.amount < 0) {
      setAlertMsg("กรุณากรอกข้อมูลอุปกรณ์ให้ถูกต้อง");
      setAlertSeverity("error");
      setOpen(true);
      return;
    }

    fetch(`http://localhost:4000/api/edit-equipment/${equipmentID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" ,"x-user-role": roleID.toString()},
      body: JSON.stringify({
        equipmentName: edited.equipmentName,
        amount: edited.amount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setAlertMsg("แก้ไขอุปกรณ์สำเร็จ");
          setAlertSeverity("success");
          setOpen(true);
          loadEquipment();
        } else {
          setAlertMsg(`เกิดข้อผิดพลาด: ${data.message}`);
          setAlertSeverity("error");
          setOpen(true);
        }
      })
      .catch(() => {
        setAlertMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        setAlertSeverity("error");
        setOpen(true);
      });
  };
const handleDeleteEquipment = (equipmentID) => {
  if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้?")) return;

  fetch(`http://localhost:4000/api/delete-equipment/${equipmentID}`, {
    method: "DELETE",
    headers: {
      "x-user-role": roleID.toString(),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status) {
        setAlertMsg("ลบอุปกรณ์สำเร็จ");
        setAlertSeverity("success");
        setOpen(true);
        loadEquipment();
      } else {
        setAlertMsg(`เกิดข้อผิดพลาด: ${data.message}`);
        setAlertSeverity("error");
        setOpen(true);
      }
    })
    .catch(() => {
      setAlertMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setAlertSeverity("error");
      setOpen(true);
    });
};



  const handleAddNewEquipment = () => {
    if (!newEquipName.trim() || Number(newEquipAmount) < 0) {
      setAlertMsg("กรุณากรอกข้อมูลอุปกรณ์ใหม่ให้ถูกต้อง");
      setAlertSeverity("error");
      setOpen(true);
      return;
    }

    fetch("http://localhost:4000/api/add-equipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": roleID.toString(),
      },
      body: JSON.stringify({
        equipmentName: newEquipName,
        amount: Number(newEquipAmount),
        typeID: 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setAlertMsg("เพิ่มอุปกรณ์ใหม่สำเร็จ");
          setAlertSeverity("success");
          setOpen(true);
          setNewEquipName("");
          setNewEquipAmount("");
          loadEquipment();
        } else {
          setAlertMsg(`เกิดข้อผิดพลาด: ${data.message}`);
          setAlertSeverity("error");
          setOpen(true);
        }
      })
      .catch(() => {
        setAlertMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        setAlertSeverity("error");
        setOpen(true);
      });
  };

  const handleIncrease = (id) => {
    setRequestAmounts((prev) => {
      const current = prev[id] || 0;
      const item = equipment.find((e) => e.equipmentID === id);
      if (!item) return prev;
      if (current < item.amount) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const handleDecrease = (id) => {
    setRequestAmounts((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
           <IconButton
             color="inherit"
             onClick={() => navigate("/bring")}
             sx={{ mr: 2 }}
             aria-label="ย้อนกลับ"
         >
           <ArrowBackIcon />
         </IconButton>
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }} onClick={() => navigate("/homepage")}>
              <Box component="img" src={logo} alt="logo" sx={{ width: 52, height: 52, objectFit: "contain" }} />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              เบิก-จ่ายอุปกรณ์สำนักงาน
            </Typography>
            {isLoggedIn && (
              <Typography sx={{ mr: 1 }}>
                {firstname} {lastname}
              </Typography>
            )}
            <IconButton color="inherit" edge="end" onClick={handleUserIconClick} sx={{ p: 0, ml: 1 }}>
              {isLoggedIn && profilePic ? (
                <Avatar src={profilePic} sx={{ width: 36, height: 36 }} />
              ) : (
                <AccountCircleIcon sx={{ width: 36, height: 36 }} />
              )}
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfile}>จัดการข้อมูลผู้ใช้</MenuItem>
              <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ maxWidth: 900, mx: "auto", mt: 6, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            รายการอุปกรณ์สำนักงาน
          </Typography>

          {isAdmin && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                เพิ่มอุปกรณ์ใหม่
              </Typography>
              <Stack spacing={2} direction="row" alignItems="center">
                <TextField
                  label="ชื่ออุปกรณ์"
                  value={newEquipName}
                  onChange={(e) => setNewEquipName(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="จำนวน"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={newEquipAmount}
                  onChange={(e) => setNewEquipAmount(e.target.value)}
                  sx={{ width: 120 }}
                />
                <Button variant="contained" color="primary" onClick={handleAddNewEquipment}>
                  เพิ่มอุปกรณ์
                </Button>
              </Stack>
            </Paper>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่ออุปกรณ์</TableCell>
                  <TableCell>จำนวนคงเหลือ</TableCell>
                  <TableCell>จำนวนที่ต้องการเบิก</TableCell>
                  {isAdmin && <TableCell>จัดการ</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                  <TableRow key={item.equipmentID}>
                    <TableCell>
                      {isAdmin ? (
                        <TextField
                          variant="standard"
                          value={editingEquipments[item.equipmentID]?.equipmentName || ""}
                          onChange={(e) => handleEditChange(item.equipmentID, "equipmentName", e.target.value)}
                        />
                      ) : (
                        item.equipmentName
                      )}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <TextField
                          variant="standard"
                          type="number"
                          inputProps={{ min: 0 }}
                          value={editingEquipments[item.equipmentID]?.amount || 0}
                          onChange={(e) => handleEditChange(item.equipmentID, "amount", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        Math.max(item.amount - (requestAmounts[item.equipmentID] || 0), 0)
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDecrease(item.equipmentID)}
                          disabled={isAdmin}
                        >
                          -
                        </Button>
                        <Typography>{requestAmounts[item.equipmentID] || 0}</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleIncrease(item.equipmentID)}
                          disabled={isAdmin || (requestAmounts[item.equipmentID] || 0) >= item.amount}
                        >
                          +
                        </Button>
                      </Stack>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSaveEdit(item.equipmentID)}
                          >
                            บันทึก
                         </Button>
                         <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteEquipment(item.equipmentID)}
                        >
                            ลบ
                         </Button>
                        </Stack>
                      </TableCell>
                    )}

                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={equipment.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
            />
          </TableContainer>
        </Box>

        <Snackbar open={open} autoHideDuration={2500} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity={alertSeverity} sx={{ width: "100%" }}>
            {alertMsg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default EditBring;
