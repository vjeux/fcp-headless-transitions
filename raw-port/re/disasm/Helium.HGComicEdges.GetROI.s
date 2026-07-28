__ZN12HGComicEdges6GetROIEP10HGRendereri6HGRect:
0000000000006390	pushq	%rbp
0000000000006391	movq	%rsp, %rbp
0000000000006394	pushq	%rbx
0000000000006395	subq	$0x18, %rsp
0000000000006399	cmpl	$0x1, %edx
000000000000639c	je	0x6404
000000000000639e	testl	%edx, %edx
00000000000063a0	jne	0x6433
00000000000063a6	movss	0x198(%rdi), %xmm0
00000000000063ae	addss	%xmm0, %xmm0
00000000000063b2	roundss	$0xa, %xmm0, %xmm0
00000000000063b8	cvttss2si	%xmm0, %eax
00000000000063bc	movq	%rax, %rdx
00000000000063bf	shlq	$0x20, %rdx
00000000000063c3	orq	%rax, %rdx
00000000000063c6	negl	%eax
00000000000063c8	movq	%rax, %rsi
00000000000063cb	shlq	$0x20, %rsi
00000000000063cf	orq	%rax, %rsi
00000000000063d2	movq	%rcx, -0x20(%rbp)
00000000000063d6	movq	%r8, -0x18(%rbp)
00000000000063da	leaq	-0x20(%rbp), %rbx
00000000000063de	movq	%rbx, %rdi
00000000000063e1	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
00000000000063e6	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000000063eb	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000000063f0	movl	$0x1, %edx
00000000000063f5	movl	$0x1, %ecx
00000000000063fa	callq	_HGRectMake4i
00000000000063ff	movq	%rbx, %rdi
0000000000006402	jmp	0x6429
0000000000006404	movq	%rcx, -0x20(%rbp)
0000000000006408	movq	%r8, -0x18(%rbp)
000000000000640c	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
0000000000006411	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000006416	movl	$0x1, %edx
000000000000641b	movl	$0x1, %ecx
0000000000006420	callq	_HGRectMake4i
0000000000006425	leaq	-0x20(%rbp), %rdi
0000000000006429	movq	%rax, %rsi
000000000000642c	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
0000000000006431	jmp	0x6441
0000000000006433	leaq	_HGRectNull(%rip), %rax
000000000000643a	movups	(%rax), %xmm0
000000000000643d	movaps	%xmm0, -0x20(%rbp)
0000000000006441	movq	-0x20(%rbp), %rax
0000000000006445	movq	-0x18(%rbp), %rdx
0000000000006449	addq	$0x18, %rsp
000000000000644d	popq	%rbx
000000000000644e	popq	%rbp
000000000000644f	retq
