__ZN17HGWhiteBalanceRAW6GetROIEP10HGRendereri6HGRect:
00000000001d2be0	testl	%edx, %edx
00000000001d2be2	je	0x1d2bf3
00000000001d2be4	leaq	_HGRectNull(%rip), %rcx
00000000001d2beb	movq	(%rcx), %rax
00000000001d2bee	movq	0x8(%rcx), %rdx
00000000001d2bf2	retq
00000000001d2bf3	pushq	%rbp
00000000001d2bf4	movq	%rsp, %rbp
00000000001d2bf7	pushq	%r14
00000000001d2bf9	pushq	%rbx
00000000001d2bfa	movq	%r8, %rbx
00000000001d2bfd	movq	%rcx, %r14
00000000001d2c00	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000001d2c05	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001d2c0a	movl	$0x1, %edx
00000000001d2c0f	movl	$0x1, %ecx
00000000001d2c14	callq	_HGRectMake4i
00000000001d2c19	movq	%rdx, %rcx
00000000001d2c1c	movq	%r14, %rdi
00000000001d2c1f	movq	%rbx, %rsi
00000000001d2c22	movq	%rax, %rdx
00000000001d2c25	popq	%rbx
00000000001d2c26	popq	%r14
00000000001d2c28	popq	%rbp
00000000001d2c29	jmp	_HGRectGrow
00000000001d2c2e	nop
