__ZN32HGCInterlaceHandler_ExtractField6GetROIEP10HGRendereri6HGRect:
00000000000933c0	pushq	%rbp
00000000000933c1	movq	%rsp, %rbp
00000000000933c4	subq	$0x10, %rsp
00000000000933c8	leaq	_HGRectNull(%rip), %rax
00000000000933cf	movups	(%rax), %xmm0
00000000000933d2	movaps	%xmm0, -0x10(%rbp)
00000000000933d6	testl	%edx, %edx
00000000000933d8	jne	0x933f5
00000000000933da	movq	%rcx, -0x10(%rbp)
00000000000933de	movq	%r8, -0x8(%rbp)
00000000000933e2	leaq	-0x10(%rbp), %rdi
00000000000933e6	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
00000000000933eb	testb	%al, %al
00000000000933ed	jne	0x933f5
00000000000933ef	shll	-0xc(%rbp)
00000000000933f2	shll	-0x4(%rbp)
00000000000933f5	movq	-0x10(%rbp), %rax
00000000000933f9	movq	-0x8(%rbp), %rdx
00000000000933fd	addq	$0x10, %rsp
0000000000093401	popq	%rbp
0000000000093402	retq
0000000000093403	nopw	%cs:(%rax,%rax)
