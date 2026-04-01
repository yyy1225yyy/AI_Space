package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.entity.JobRoleConfig;
import com.aisquare.entity.Tag;
import com.aisquare.service.JobRoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-roles")
public class JobRoleController {

    private final JobRoleService jobRoleService;

    public JobRoleController(JobRoleService jobRoleService) {
        this.jobRoleService = jobRoleService;
    }

    @GetMapping
    public Result<List<JobRoleConfig>> getAllJobRoles() {
        return Result.success(jobRoleService.getAllJobRoles());
    }

    @GetMapping("/{key}")
    public Result<JobRoleConfig> getJobRole(@PathVariable String key) {
        return Result.success(jobRoleService.getJobRole(key));
    }

    @GetMapping("/{key}/tags")
    public Result<List<Tag>> getJobRoleTags(@PathVariable String key) {
        return Result.success(jobRoleService.getJobRoleTags(key));
    }

    @GetMapping("/{key}/stats")
    public Result<Map<String, Object>> getJobRoleStats(@PathVariable String key) {
        return Result.success(jobRoleService.getJobRoleStats(key));
    }
}
