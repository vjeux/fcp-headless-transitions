__ZN15soDeinterlaceLA6GetROIEP10HGRendereri6HGRect:
000000000003e390	pushq	%rbp
000000000003e391	movq	%rsp, %rbp
000000000003e394	pushq	%r15
000000000003e396	pushq	%r14
000000000003e398	pushq	%r12
000000000003e39a	pushq	%rbx
000000000003e39b	subq	$0x20, %rsp
000000000003e39f	movq	0x9c3eb2(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000003e3a6	movq	(%rax), %rax
000000000003e3a9	movq	%rax, -0x28(%rbp)
000000000003e3ad	testl	%edx, %edx
000000000003e3af	je	0x3e3f0
000000000003e3b1	leaq	_HGRectNull(%rip), %rax
000000000003e3b8	movq	(%rax), %rbx
000000000003e3bb	movq	0x8(%rax), %rdx
000000000003e3bf	movq	%rbx, %rcx
000000000003e3c2	shrq	$0x20, %rcx
000000000003e3c6	movq	0x9c3e8b(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000003e3cd	movq	(%rax), %rax
000000000003e3d0	cmpq	-0x28(%rbp), %rax
000000000003e3d4	jne	0x3e474
000000000003e3da	shlq	$0x20, %rcx
000000000003e3de	movl	%ebx, %eax
000000000003e3e0	orq	%rcx, %rax
000000000003e3e3	addq	$0x20, %rsp
000000000003e3e7	popq	%rbx
000000000003e3e8	popq	%r12
000000000003e3ea	popq	%r14
000000000003e3ec	popq	%r15
000000000003e3ee	popq	%rbp
000000000003e3ef	retq
000000000003e3f0	movq	%r8, %rbx
000000000003e3f3	movq	%rcx, %r14
000000000003e3f6	movq	%rdi, %r15
000000000003e3f9	xorl	%edi, %edi
000000000003e3fb	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
000000000003e400	xorl	%edx, %edx
000000000003e402	movl	$0x1, %ecx
000000000003e407	callq	_HGRectMake4i
000000000003e40c	movq	%rdx, %rcx
000000000003e40f	movq	%r14, %rdi
000000000003e412	movq	%rbx, %rsi
000000000003e415	movq	%rax, %rdx
000000000003e418	callq	_HGRectGrow
000000000003e41d	movq	%rax, %rbx
000000000003e420	movq	%rdx, %r14
000000000003e423	movq	%rax, %r12
000000000003e426	shrq	$0x20, %r12
000000000003e42a	movq	(%r15), %rax
000000000003e42d	leaq	-0x40(%rbp), %rdx
000000000003e431	movq	%r15, %rdi
000000000003e434	xorl	%esi, %esi
000000000003e436	callq	*0x68(%rax)
000000000003e439	cvttss2si	-0x3c(%rbp), %ecx
000000000003e43e	cmpl	%ecx, %r12d
000000000003e441	cmovgl	%r12d, %ecx
000000000003e445	movq	%r14, %rax
000000000003e448	cvttss2si	-0x38(%rbp), %esi
000000000003e44d	shrq	$0x20, %rax
000000000003e451	cmpl	%esi, %eax
000000000003e453	cmovll	%eax, %esi
000000000003e456	shlq	$0x20, %rsi
000000000003e45a	movl	%r14d, %edx
000000000003e45d	orq	%rsi, %rdx
000000000003e460	movq	0x9c3df1(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000003e467	movq	(%rax), %rax
000000000003e46a	cmpq	-0x28(%rbp), %rax
000000000003e46e	je	0x3e3da
000000000003e474	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
000000000003e479	nopl	(%rax)
