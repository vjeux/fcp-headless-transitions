__ZN8HGDither12SetParameterEiffff:
000000000006fa10	pushq	%rbp
000000000006fa11	movq	%rsp, %rbp
000000000006fa14	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000006fa19	testl	%esi, %esi
000000000006fa1b	je	0x6fa1f
000000000006fa1d	popq	%rbp
000000000006fa1e	retq
000000000006fa1f	xorps	%xmm1, %xmm1
000000000006fa22	ucomiss	%xmm1, %xmm0
000000000006fa25	setp	%al
000000000006fa28	setne	%cl
000000000006fa2b	orb	%al, %cl
000000000006fa2d	xorl	%eax, %eax
000000000006fa2f	cmpb	%cl, 0x1c0(%rdi)
000000000006fa35	je	0x6fa1d
000000000006fa37	movb	%cl, 0x1c0(%rdi)
000000000006fa3d	movl	$0x1, %eax
000000000006fa42	popq	%rbp
000000000006fa43	retq
000000000006fa44	nopw	%cs:(%rax,%rax)
