__ZN11AUGainStageC2EP23ComponentInstanceRecordb:
0000000001243f40	pushq	%rbp
0000000001243f41	movq	%rsp, %rbp
0000000001243f44	pushq	%r14
0000000001243f46	pushq	%rbx
0000000001243f47	movl	%edx, %r14d
0000000001243f4a	movq	%rdi, %rbx
0000000001243f4d	movl	$0x1, %edx
0000000001243f52	callq	0x1496b3a                       ## symbol stub for: __ZN5ausdk12AUEffectBaseC2EP23ComponentInstanceRecordb
0000000001243f57	leaq	0x6db262(%rip), %rax
0000000001243f5e	movq	%rax, (%rbx)
0000000001243f61	movb	%r14b, 0x28c(%rbx)
0000000001243f68	movq	0x48(%rbx), %rdi
0000000001243f6c	testq	%rdi, %rdi
0000000001243f6f	je	0x1243f7e
0000000001243f71	movq	(%rdi), %rax
0000000001243f74	xorl	%esi, %esi
0000000001243f76	callq	*0x20(%rax)
0000000001243f79	movq	%rax, %rdi
0000000001243f7c	jmp	0x1243f8f
0000000001243f7e	movq	0x30(%rbx), %rax
0000000001243f82	cmpq	%rax, 0x38(%rbx)
0000000001243f86	je	0x1243f8d
0000000001243f88	movq	(%rax), %rdi
0000000001243f8b	jmp	0x1243f8f
0000000001243f8d	xorl	%edi, %edi
0000000001243f8f	movss	0x328d39(%rip), %xmm0
0000000001243f97	xorl	%esi, %esi
0000000001243f99	xorl	%edx, %edx
0000000001243f9b	callq	0x1496bca                       ## symbol stub for: __ZN5ausdk9AUElement12SetParameterEjfb
0000000001243fa0	cmpb	$0x1, 0x28c(%rbx)
0000000001243fa7	jne	0x124404f
0000000001243fad	movq	0x48(%rbx), %rdi
0000000001243fb1	testq	%rdi, %rdi
0000000001243fb4	je	0x1243fc3
0000000001243fb6	movq	(%rdi), %rax
0000000001243fb9	xorl	%esi, %esi
0000000001243fbb	callq	*0x20(%rax)
0000000001243fbe	movq	%rax, %rdi
0000000001243fc1	jmp	0x1243fd4
0000000001243fc3	movq	0x30(%rbx), %rax
0000000001243fc7	cmpq	%rax, 0x38(%rbx)
0000000001243fcb	je	0x1243fd2
0000000001243fcd	movq	(%rax), %rdi
0000000001243fd0	jmp	0x1243fd4
0000000001243fd2	xorl	%edi, %edi
0000000001243fd4	xorps	%xmm0, %xmm0
0000000001243fd7	movl	$0x1, %esi
0000000001243fdc	xorl	%edx, %edx
0000000001243fde	callq	0x1496bca                       ## symbol stub for: __ZN5ausdk9AUElement12SetParameterEjfb
0000000001243fe3	movq	0x48(%rbx), %rdi
0000000001243fe7	testq	%rdi, %rdi
0000000001243fea	je	0x1243ff9
0000000001243fec	movq	(%rdi), %rax
0000000001243fef	xorl	%esi, %esi
0000000001243ff1	callq	*0x20(%rax)
0000000001243ff4	movq	%rax, %rdi
0000000001243ff7	jmp	0x124400a
0000000001243ff9	movq	0x30(%rbx), %rax
0000000001243ffd	cmpq	%rax, 0x38(%rbx)
0000000001244001	je	0x1244008
0000000001244003	movq	(%rax), %rdi
0000000001244006	jmp	0x124400a
0000000001244008	xorl	%edi, %edi
000000000124400a	xorps	%xmm0, %xmm0
000000000124400d	movl	$0x2, %esi
0000000001244012	xorl	%edx, %edx
0000000001244014	callq	0x1496bca                       ## symbol stub for: __ZN5ausdk9AUElement12SetParameterEjfb
0000000001244019	movq	0x48(%rbx), %rdi
000000000124401d	testq	%rdi, %rdi
0000000001244020	je	0x124402f
0000000001244022	movq	(%rdi), %rax
0000000001244025	xorl	%esi, %esi
0000000001244027	callq	*0x20(%rax)
000000000124402a	movq	%rax, %rdi
000000000124402d	jmp	0x1244040
000000000124402f	movq	0x30(%rbx), %rax
0000000001244033	cmpq	%rax, 0x38(%rbx)
0000000001244037	je	0x124403e
0000000001244039	movq	(%rax), %rdi
000000000124403c	jmp	0x1244040
000000000124403e	xorl	%edi, %edi
0000000001244040	xorps	%xmm0, %xmm0
0000000001244043	movl	$0x3, %esi
0000000001244048	xorl	%edx, %edx
000000000124404a	callq	0x1496bca                       ## symbol stub for: __ZN5ausdk9AUElement12SetParameterEjfb
000000000124404f	popq	%rbx
0000000001244050	popq	%r14
0000000001244052	popq	%rbp
0000000001244053	retq
0000000001244054	movq	%rax, %r14
0000000001244057	movq	%rbx, %rdi
000000000124405a	callq	__ZN5ausdk12AUEffectBaseD2Ev    ## ausdk::AUEffectBase::~AUEffectBase()
000000000124405f	movq	%r14, %rdi
0000000001244062	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001244067	nopw	(%rax,%rax)
