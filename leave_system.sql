create schema leave_system collate utf8_general_ci;

create table departments
(
	department_id int auto_increment
		primary key,
	department_name varchar(150) not null,
	is_enabled enum('N', 'Y') default 'Y' null,
	constraint departments_department_name_uindex
		unique (department_name)
)
comment 'ข้อมูลหน่วยงานหลัก';

create table employee_types
(
	employee_type_id int auto_increment
		primary key,
	employee_type_name varchar(150) not null,
	max_days int null comment 'จำนวนวันลาสูงสุดที่สามารถสะสมได้',
	constraint employee_types_employee_type_name_uindex
		unique (employee_type_name)
)
comment 'ประเภทพนักงาน';

create table employees
(
	employee_id int auto_increment
		primary key,
	username varchar(50) not null,
	password varchar(200) not null,
	first_name varchar(100) not null comment 'ชื่อ',
	last_name varchar(100) not null comment 'สกุล',
	employee_type_id int not null comment 'ประเภทพนักงาน',
	department_id int not null comment 'หน่วยงานหลัก',
	sub_department_id int not null comment 'หน่วยงานย่อย',
	is_enabled enum('Y', 'N') default 'Y' null,
	created_at datetime default current_timestamp() null,
	constraint employees_username_uindex
		unique (username)
)
comment 'พนักงาน/เจ้าหน้าที่';

create table leave_days
(
	leave_days_id int auto_increment
		primary key,
	employee_id int not null comment 'รหัสเจ้าหน้าที่',
	leave_type_id int not null comment 'ประเภทการลา',
	leave_days_num int default 0 null comment 'จำนวนวันที่ลา',
	period_id int not null comment 'รหัสปีงบประมาณ'
)
comment 'จำนวนวันลาปัจจุบัน';

create table leave_days_settings
(
	leave_setting_id int auto_increment
		primary key,
	employee_type_id int not null,
	leave_type_id int null comment 'ประเภทการลาพักผ่อน',
	leave_days int default 10 null comment 'จำนวนวันที่สามารถลาได้ใน 1 ปีงบประมาณ',
	max_leave_days int default 0 null comment 'จำนวนวันลาสะสมสูงสุด',
	period_id int not null comment 'ปีงบประมาณ',
	constraint leave_settings_employee_type_id_uindex
		unique (employee_type_id)
)
comment 'กำหนดจำนวนวันลา';

create table leave_status_logs
(
	leave_status_log_id int auto_increment
		primary key,
	leave_id int not null comment 'รหัสใบลา',
	leave_status enum('DRAFT', 'APPROVED', 'CANCEL', 'DENIED') default 'DRAFT' not null comment 'สถานะการลา',
	user_id int not null comment 'รหัสเจ้าหน้าที่ (users)',
	created_at datetime default current_timestamp() null
);

create table leave_types
(
	leave_type_id int auto_increment
		primary key,
	leave_type_name varchar(100) not null
)
comment 'ประเภทการลา';

create table leaves
(
	leave_id int auto_increment
		primary key,
	period_id int not null comment 'ปีงบประมาณ',
	employee_id int not null comment 'รหัสพนักงาน',
	leave_type int null comment 'ประเภทการลา',
	current_leave_days int default 0 null,
	leave_days int default 1 null,
	start_date date null comment 'วันที่เริ่มลา',
	end_date date null comment 'วันที่สิ้นสุดการลา',
	leave_status enum('DRAFT', 'APPROVED', 'CANCEL', 'DENIED') default 'DRAFT' null,
	created_at datetime default current_timestamp() null comment 'วันที่สร้างใบลา'
)
comment 'การลา';

create table periods
(
	period_id int auto_increment
		primary key,
	period_name varchar(50) not null,
	start_date date not null,
	end_date date not null
)
comment 'ปีงบประมาณ';

create table sub_departments
(
	sub_department_id int auto_increment
		primary key,
	department_id int not null,
	sub_department_name varchar(150) not null,
	is_enabled enum('N', 'Y') default 'Y' null
)
comment 'หน่วยงานย่อย';

create table user_sub_departments
(
	manager_sub_id int auto_increment
		primary key,
	user_id int not null comment 'รหัสหัวหน้าหน่วยงาน จากตาราง users -> MANAGER',
	sub_department_id int not null comment 'รหัสหน่วยงานย่อย'
)
comment 'เก็บข้อมูลหัวหน้าหน่วยงานและหน่วยงานย่อยที่ดูแล';

create table users
(
	user_id int auto_increment
		primary key,
	username varchar(50) not null,
	password varchar(200) not null,
	first_name varchar(150) not null,
	last_name varchar(150) null,
	user_type enum('ADMIN', 'STAFF', 'MANAGER', 'USER') default 'USER' not null,
	is_enabled enum('N', 'Y') default 'Y' null,
	constraint users_username_uindex
		unique (username)
)
comment 'ข้อมูลผู้ใช้งาน';

