from django.contrib import admin
from . import models

for model in [models.Customer, models.Department, models.WorkCenter, models.Equipment,
              models.Employee, models.Product, models.OperationDefinition, models.RouteOperation, models.CuttingNorm, models.Order,
              models.OrderItem, models.Program, models.ProgramLine, models.NormingApproval, models.Job,
              models.ProductionEvent, models.QualityCheck, models.Material,
              models.MaterialRequirement, models.Downtime, models.TimesheetEntry, models.AuditLog]:
    admin.site.register(model)
