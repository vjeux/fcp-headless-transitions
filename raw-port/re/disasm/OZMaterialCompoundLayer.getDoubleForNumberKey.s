__ZN23OZMaterialCompoundLayer21getDoubleForNumberKeyEP8NSStringP12NSDictionaryd:
00000000001ff570	pushq	%rbp
00000000001ff571	movq	%rsp, %rbp
00000000001ff574	subq	$0x10, %rsp
00000000001ff578	movsd	%xmm0, -0x8(%rbp)
00000000001ff57d	movq	%rdx, %rdi
00000000001ff580	movq	%rsi, %rdx
00000000001ff583	movq	0x709936(%rip), %rsi
00000000001ff58a	callq	*0x626a98(%rip)                 ## Objc message: -[%rdi getInitialValue:]
00000000001ff590	testq	%rax, %rax
00000000001ff593	je	0x1ff5aa
00000000001ff595	movq	0x70b7cc(%rip), %rsi
00000000001ff59c	movq	%rax, %rdi
00000000001ff59f	addq	$0x10, %rsp
00000000001ff5a3	popq	%rbp
00000000001ff5a4	jmpq	*0x626a7e(%rip)                 ## Objc message: -[%rdi getInitialValue:]
00000000001ff5aa	movsd	-0x8(%rbp), %xmm0
00000000001ff5af	addq	$0x10, %rsp
00000000001ff5b3	popq	%rbp
00000000001ff5b4	retq
00000000001ff5b5	nopw	%cs:(%rax,%rax)
