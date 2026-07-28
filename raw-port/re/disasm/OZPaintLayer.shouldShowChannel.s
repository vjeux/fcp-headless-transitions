__ZN12OZPaintLayer17shouldShowChannelEjP20OZMaterialPaintLayer:
0000000000622070	pushq	%rbp
0000000000622071	movq	%rsp, %rbp
0000000000622074	leal	-0x68(%rsi), %ecx
0000000000622077	cmpl	$0xb, %ecx
000000000062207a	ja	0x622090
000000000062207c	movb	$0x1, %al
000000000062207e	leaq	0x4b(%rip), %rsi
0000000000622085	movslq	(%rsi,%rcx,4), %rcx
0000000000622089	addq	%rsi, %rcx
000000000062208c	jmpq	*%rcx
000000000062208e	popq	%rbp
000000000062208f	retq
0000000000622090	cmpl	$0xc8, %esi
0000000000622096	jne	0x6220a4
0000000000622098	movq	(%rdi), %rax
000000000062209b	movq	(%rax), %rax
000000000062209e	movq	%rdx, %rsi
00000000006220a1	popq	%rbp
00000000006220a2	jmpq	*%rax
00000000006220a4	xorl	%eax, %eax
00000000006220a6	popq	%rbp
00000000006220a7	retq
00000000006220a8	movq	(%rdi), %rax
00000000006220ab	movq	0x10(%rax), %rax
00000000006220af	movq	%rdx, %rsi
00000000006220b2	popq	%rbp
00000000006220b3	jmpq	*%rax
00000000006220b5	movq	(%rdi), %rax
00000000006220b8	movq	0x18(%rax), %rax
00000000006220bc	movq	%rdx, %rsi
00000000006220bf	popq	%rbp
00000000006220c0	jmpq	*%rax
00000000006220c2	movq	(%rdi), %rax
00000000006220c5	movq	0x8(%rax), %rax
00000000006220c9	movq	%rdx, %rsi
00000000006220cc	popq	%rbp
00000000006220cd	jmpq	*%rax
00000000006220cf	nop
00000000006220d0	movl	$0xbeffffff, %esi               ## imm = 0xBEFFFFFF
00000000006220d5	.byte 0xff #bad opcode
00000000006220d6	.byte 0xff #bad opcode
00000000006220d7	.byte 0xff #bad opcode
00000000006220d8	movl	$0xe5ffffff, %esi               ## imm = 0xE5FFFFFF
00000000006220dd	.byte 0xff #bad opcode
00000000006220de	.byte 0xff #bad opcode
00000000006220df	callq	*%rsp
00000000006220e1	.byte 0xff #bad opcode
00000000006220e2	.byte 0xff #bad opcode
00000000006220e3	callq	*%rsp
00000000006220e5	.byte 0xff #bad opcode
00000000006220e6	.byte 0xff #bad opcode
00000000006220e7	callq	*%rsp
00000000006220e9	.byte 0xff #bad opcode
00000000006220ea	.byte 0xff #bad opcode
00000000006220eb	callq	*%rsp
00000000006220ed	.byte 0xff #bad opcode
00000000006220ee	.byte 0xff #bad opcode
00000000006220ef	callq	*%rsp
00000000006220f1	.byte 0xff #bad opcode
00000000006220f2	.byte 0xff #bad opcode
00000000006220f3	pushq	%rdx
00000000006220f5	.byte 0xff #bad opcode
00000000006220f6	.byte 0xff #bad opcode
00000000006220f7	callq	*%rsp
00000000006220f9	.byte 0xff #bad opcode
00000000006220fa	.byte 0xff #bad opcode
00000000006220fb	.byte 0xff #bad opcode
00000000006220fc	fdivr	%st(7), %st
00000000006220fe	.byte 0xff #bad opcode
00000000006220ff	callq	*0x48(%rbp)
0000000000622102	movl	%esp, %ebp
0000000000622104	movq	%rsi, %rdi
0000000000622107	movq	(%rsi), %rax
000000000062210a	movq	0x328(%rax), %rax
0000000000622111	movq	%rdx, %rsi
0000000000622114	popq	%rbp
0000000000622115	jmpq	*%rax
0000000000622117	nopw	(%rax,%rax)
