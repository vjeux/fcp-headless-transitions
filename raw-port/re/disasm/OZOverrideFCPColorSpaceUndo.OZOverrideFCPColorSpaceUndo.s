__ZN27OZOverrideFCPColorSpaceUndoC1EPK10OZDocument:
00000000001016f0	pushq	%rbp
00000000001016f1	movq	%rsp, %rbp
00000000001016f4	pushq	%rbx
00000000001016f5	pushq	%rax
00000000001016f6	movq	%rdi, %rbx
00000000001016f9	leaq	0x73bf28(%rip), %rax
0000000000101700	movq	%rax, (%rdi)
0000000000101703	movq	%rsi, %rdi
0000000000101706	callq	__ZNK10OZDocument24getOverrideFCPColorSpaceEv ## OZDocument::getOverrideFCPColorSpace() const
000000000010170b	movb	%al, 0x8(%rbx)
000000000010170e	addq	$0x8, %rsp
0000000000101712	popq	%rbx
0000000000101713	popq	%rbp
0000000000101714	retq
0000000000101715	nopw	%cs:(%rax,%rax)
