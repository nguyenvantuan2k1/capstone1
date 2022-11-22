import MyButton from '@/components/basic/button';
import { DownOutlined, PlusCircleFilled, UploadOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Button, Dropdown, Input, Menu, Space, Table, Upload, Form, Modal, Select } from 'antd';
import { FC, useContext, useEffect, useState } from 'react';
import { supabase } from './../../../config/supabase';
// import Search from 'antd/es/transfer/search';
import { AuthContext } from './../../../context/AuthContext';
import './style.css';
import { toast } from 'react-hot-toast';

const { Search } = Input;
// const handleMenuClick = e => {
//   message.info('Click on menu item.');
//   console.log('click', e);
// };
const onC = e => {
  console.log(e);
};
const onSearch = e => {
  return;
};

const BusinessWithAsidePage: FC = () => {
  const [listDataClassesResponse, setListDataClassesResponse] = useState<any[]>([]);

  const [liststudent, setliststudent] = useState();
  const currentUser = useContext(AuthContext);
  const [ClassCode, setClassCode] = useState('Class code');
  const [SchoolYear, setSchoolYear] = useState('School year');
  const [Semester, setSemester] = useState('Semester');
  const [classID, setClassID] = useState();
  const useID = currentUser?.currentUser?.id;
  const columns = [
    {
      title: '#',
      dataIndex: '',
      key: '',
      render: (id, record, index) => {
        ++index;

        return index;
      },
    },
    {
      title: 'Student code',
      dataIndex: 'student_code',
      key: 'student_code',
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* {record.id} */}
          <MyButton type="text">Edit </MyButton>
          <MyButton type="text">Delete</MyButton>
        </Space>
      ),
    },
  ];
  const [loading, setloading] = useState(true);

  useEffect(async () => {
    const { data: classes, err } = await supabase
      .from('classes')
      .select('*', 'class_code')
      .eq('uid', useID)
      .eq('is_delete', false);

    setListDataClassesResponse(classes);
  }, [useID]);

  const menuSchoolYear = () => {
    const schoolYear = new Set(listDataClassesResponse.map(e => e.school_year));

    const schoolYearList = [...schoolYear];

    const schoolYearListRender = schoolYearList.map(e => ({
      key: e,
      label: e,
    }));

    return (
      <Menu
        onClick={e => {
          setloading(true);
          setSchoolYear(e.key);
          setSemester('Semester');
          setClassCode('ClassCode');
          setClassID('');
        }}
        items={schoolYearListRender}
      />
    );
  };

  const menuSemester = () => {
    const semesterList = listDataClassesResponse.filter(c => c.school_year === SchoolYear);

    const semesterLists = new Set(semesterList.map(e => e.semester).sort());

    const semesterListData = [...semesterLists];

    const semesterListRender = semesterListData.map(c => ({
      key: c,
      label: c,
    }));

    return (
      <Menu
        onClick={e => {
          setSemester(e.key);
        }}
        items={semesterListRender}
      />
    );
  };
  const menuClassCode = () => {
    const classCodeList = listDataClassesResponse.filter(c => c.school_year === SchoolYear && c.semester === Semester);

    const classCodeListTmp = new Set(classCodeList.map(e => e.class_code).sort());

    const classCodeListRender = [...classCodeListTmp].map(c => ({
      key: c,
      label: c,
    }));

    return (
      <Menu
        onClick={async e => {
          setClassCode(e.key);
          if (SchoolYear && Semester && ClassCode) {
            const { ...Class } = listDataClassesResponse.filter(
              c => c.school_year === SchoolYear && c.semester === Semester && c.class_code === e.key,
            );

            const idClass = Class[0].id;

            setClassID(idClass);

            const { data: students, err } = await supabase
              .from('students')
              .select('*')
              .eq('class_id', idClass)
              .eq('is_delete', false);

            setliststudent(students);
            setloading(false);
            console.log(students);
          }
        }}
        items={classCodeListRender}
      />
    );
  };
  // function refresh
  const refreshData = async () => {
    const { data } = await supabase.from('students').select('*').eq('class_id', classID).eq('is_delete', false);

    setliststudent(data);
  };
  //xu ly modal o day
  //modal of add student

  const [form] = Form.useForm();
  const [isModalOpenAddStudent, setIsModalOpenAddStudent] = useState(false);
  const showModal = () => {
    form.resetFields();
    if (classID) setIsModalOpenAddStudent(true);
    else {
      toast.error('please choose a class for add student!', {
        duration: 5000,
      });
    }
  };
  const handleOkForAddStudent = async e => {
    try {
      e.class_id = classID;

      const { error } = await supabase.from('students').insert(e);

      refreshData();
      toast.success('Add student success.', {
        duration: 5000,
      });
    } catch (error) {
      toast.error('somthing went wrong!', {
        duration: 5000,
      });
    }

    setIsModalOpenAddStudent(false);
  };
  const handleCancel = () => {
    setIsModalOpenAddStudent(false);
  };

  return (
    <div css={styles}>
      <div className="tabs-main">
        <div className="aside-main">
          <div style={{ display: 'flex', paddingBottom: '40px' }}>
            <label style={{ paddingRight: '20px' }}>Please choose a class</label>
            <Dropdown overlay={menuSchoolYear()} className="dropdown-scroll">
              <Button>
                <Space>
                  {SchoolYear}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            <Dropdown overlay={menuSemester()} className="dropdown-scroll">
              <Button>
                <Space>
                  {Semester}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Dropdown overlay={menuClassCode()} className="dropdown-scroll">
              <Button>
                <Space>
                  {ClassCode}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            <div style={{ paddingLeft: '300px', justifyContent: 'center' }}>
              <Search
                placeholder="Search students..."
                onSearch={onSearch}
                enterButton
                style={{
                  width: 250,
                  paddingRight: '10px',
                }}
              />
            </div>
            <div style={{ paddingLeft: '10px', justifyContent: 'center' }}>
              <Button onClick={showModal}>
                <PlusCircleFilled style={{ color: '#1E90FF' }} />
                Add Student
              </Button>
            </div>
          </div>

          <div className="table">
            <Table
              pagination={{ pageSize: 5 }}
              dataSource={liststudent}
              columns={columns}
              bordered
              onChange={onC}
              loading={loading}
            />
          </div>
          <Modal title="Add Class" open={isModalOpenAddStudent} onOk={form.submit} onCancel={handleCancel}>
            <Form form={form} onFinish={handleOkForAddStudent}>
              <Form.Item
                name="class_code"
                label="Class code"
                rules={[
                  {
                    required: true,
                    message: 'Input class code',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="Class name"
                rules={[
                  {
                    required: true,
                    message: 'Input class name',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="school_year"
                label="School Year"
                rules={[
                  {
                    required: true,
                    message: 'Input school year',
                  },
                ]}
              >
                <Select>
                  <Select.Option value="2019-2020">2019-2020</Select.Option>
                  <Select.Option value="2020-2021">2020-2021</Select.Option>
                  <Select.Option value="2021-2022">2021-2022</Select.Option>
                  <Select.Option value="2022-2023">2022-2023</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="semester"
                label="semester"
                rules={[
                  {
                    required: true,
                    message: 'choose semester',
                  },
                ]}
              >
                <Select>
                  <Select.Option value="I">I</Select.Option>
                  <Select.Option value="II">II</Select.Option>
                  <Select.Option value="vacation">vacation</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input type="textarea" />
              </Form.Item>
            </Form>
          </Modal>
          <div>
            <Space>
              <Space
                direction="vertical"
                style={{
                  width: '100%',
                }}
                size="large"
              >
                <Upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />}>Upload (Max: 1)</Button>
                </Upload>
              </Space>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};
const styles = css`
  display: flex;
  flex-direction: column;
  .tabs-main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .search {
    margin-bottom: 10px;
  }

  .aside-main {
    display: flex;
    flex: 1;
    overflow: hidden;
    flex-direction: column;
    // padding: 20px;
    margin: 30px;
  }

  .table {
    flex: 1;
    overflow: hidden;
  }
`;

export default BusinessWithAsidePage;
