__ZN17OZChannelPositionD2Ev:
0000000000073dc0	pushq	%rbp
0000000000073dc1	movq	%rsp, %rbp
0000000000073dc4	pushq	%r14
0000000000073dc6	pushq	%rbx
0000000000073dc7	movq	%rdi, %rbx
0000000000073dca	leaq	0x69257(%rip), %rax
0000000000073dd1	movq	%rax, (%rdi)
0000000000073dd4	leaq	0x69595(%rip), %rax
0000000000073ddb	movq	%rax, 0x10(%rdi)
0000000000073ddf	leaq	0x2bc(%rdi), %r14
0000000000073de6	movq	%r14, %rdi
0000000000073de9	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
0000000000073dee	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073df8	movq	%rax, 0x238(%rbx)
0000000000073dff	movq	%rax, 0x210(%rbx)
0000000000073e06	movq	%rax, 0x1e8(%rbx)
0000000000073e0d	movq	%rax, 0x1c0(%rbx)
0000000000073e14	xorps	%xmm0, %xmm0
0000000000073e17	movups	%xmm0, 0x1c8(%rbx)
0000000000073e1e	movups	%xmm0, 0x1d8(%rbx)
0000000000073e25	movups	%xmm0, 0x1f0(%rbx)
0000000000073e2c	movups	%xmm0, 0x200(%rbx)
0000000000073e33	movups	%xmm0, 0x218(%rbx)
0000000000073e3a	movups	%xmm0, 0x228(%rbx)
0000000000073e41	movl	$0x0, 0x2b8(%rbx)
0000000000073e4b	movq	%r14, %rdi
0000000000073e4e	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
0000000000073e53	movq	%r14, %rdi
0000000000073e56	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
0000000000073e5b	movq	0x2a0(%rbx), %rdi
0000000000073e62	testq	%rdi, %rdi
0000000000073e65	je	0x73e73
0000000000073e67	movq	%rdi, 0x2a8(%rbx)
0000000000073e6e	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073e73	movq	0x288(%rbx), %rdi
0000000000073e7a	testq	%rdi, %rdi
0000000000073e7d	je	0x73e8b
0000000000073e7f	movq	%rdi, 0x290(%rbx)
0000000000073e86	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073e8b	movq	0x270(%rbx), %rdi
0000000000073e92	testq	%rdi, %rdi
0000000000073e95	je	0x73ea3
0000000000073e97	movq	%rdi, 0x278(%rbx)
0000000000073e9e	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073ea3	movq	0x258(%rbx), %rdi
0000000000073eaa	testq	%rdi, %rdi
0000000000073ead	je	0x73ebb
0000000000073eaf	movq	%rdi, 0x260(%rbx)
0000000000073eb6	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073ebb	movq	0x240(%rbx), %rdi
0000000000073ec2	testq	%rdi, %rdi
0000000000073ec5	je	0x73ed3
0000000000073ec7	movq	%rdi, 0x248(%rbx)
0000000000073ece	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073ed3	movq	%rbx, %rdi
0000000000073ed6	popq	%rbx
0000000000073ed7	popq	%r14
0000000000073ed9	popq	%rbp
0000000000073eda	jmp	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000073edf	movq	%rax, %rdi
0000000000073ee2	callq	___clang_call_terminate
0000000000073ee7	addb	%dl, 0x48(%rbp)
0000000000073eea	movl	%esp, %ebp
0000000000073eec	popq	%rbp
0000000000073eed	jmp	__ZN17OZChannelPositionD2Ev     ## OZChannelPosition::~OZChannelPosition()
