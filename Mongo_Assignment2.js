// Design database for Zen class programme

// users
{
    _id: 'ObjectId',
    name: 'String',
    email: 'String',
    contact_number: 'String',
    mentor_id: 'ObjectId'
}
  
// codekata
{
    _id: 'ObjectId',
    user_id: 'ObjectId',
    problem_id: 'String',
    problem_name: 'String',
    date_solved: 'Date',
    status: 'String'  // "solved" or "not solved"
  }
  

// attendance
{
    _id: 'ObjectId',
    user_id: 'ObjectId',
    date: 'Date',
    status: 'String'  // "Present" or "Absent"
  }
  
// topics
{
    _id: 'ObjectId',
    topic_name: 'String',
    date_covered: 'Date'
  }
  
// tasks
{
    _id: 'ObjectId',
    topic_id: 'ObjectId',
    user_id: 'ObjectId',
    task_description: 'String',
    submission_date: 'Date',
    status: 'String'  // "Submitted" or "Not Submitted"
  }
  
// company_drives
{
    _id: 'ObjectId',
    company_name: 'String',
    drive_date: 'Date'
  }
  
// mentors
{
    _id: 'ObjectId',
    name: 'String',
    email: 'String'
  }
//Company drives
{
    _id: 'ObjectId',
    user_id: 'ObjectId',
    drive_id: 'ObjectId'
  }
  
  
// Find all the topics and tasks which are thought in the month of October
db.topics.aggregate([
    {
        $match: {
            date_covered: {
                $gte: ISODate("2020-10-01T00:00:00Z"),
                $lt: ISODate("2020-11-01T00:00:00Z")
            }
        }
    },
    {
        $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "topic_id",
            as: "tasks"
        }
    },
    {
        $project: {
            topic_name: 1,
            "tasks.task_description": 1
        }
    }
])

// Find all the company drives which appeared between 15 oct-2020 and 31-oct-2020
db.company_drives.find({
    drive_date: {
        $gte: ISODate("2020-10-15T00:00:00Z"),
        $lt: ISODate("2020-11-01T00:00:00Z")
    }
})

// Find all the company drives and students who are appeared for the placement.
db.user_company_drives.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $lookup: {
            from: "company_drives",
            localField: "drive_id",
            foreignField: "_id",
            as: "drive"
        }
    },
    {
        $project: {
            "user.name": 1,
            "drive.company_name": 1
        }
    }
])

// Find the number of problems solved by the user in codekata
db.codekata.aggregate([
    {
        $match: {
            status: "solved"
        }
    },
    {
        $group: {
            _id: "$user_id",
            problems_solved: { $sum: 1 }
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $project: {
            "user.name": 1,
            problems_solved: 1
        }
    }
])

// Find all the mentors with who has the mentee's count more than 15
db.users.aggregate([
    {
        $group: {
            _id: "$mentor_id",
            mentee_count: { $sum: 1 }
        }
    },
    {
        $match: {
            mentee_count: { $gt: 15 }
        }
    },
    {
        $lookup: {
            from: "mentors",
            localField: "_id",
            foreignField: "_id",
            as: "mentor"
        }
    },
    {
        $project: {
            "mentor.name": 1,
            mentee_count: 1
        }
    }
])

// Find the number of users who are absent and task is not submitted  between 15 oct-2020 and 31-oct-2020
db.attendance.aggregate([
    {
        $match: {
            status: "Absent",
            date: {
                $gte: ISODate("2020-10-15T00:00:00Z"),
                $lt: ISODate("2020-11-01T00:00:00Z")
            }
        }
    },
    {
        $lookup: {
            from: "tasks",
            localField: "user_id",
            foreignField: "user_id",
            as: "tasks"
        }
    },
    {
        $unwind: "$tasks"
    },
    {
        $match: {
            "tasks.status": "Not Submitted",
            "tasks.submission_date": {
                $gte: ISODate("2020-10-15T00:00:00Z"),
                $lt: ISODate("2020-11-01T00:00:00Z")
            }
        }
    },
    {
        $group: {
            _id: "$user_id",
            absent_and_not_submitted_count: { $sum: 1 }
        }
    }
])

