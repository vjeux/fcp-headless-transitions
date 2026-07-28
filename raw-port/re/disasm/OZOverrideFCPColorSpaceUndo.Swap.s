__ZN27OZOverrideFCPColorSpaceUndo4SwapEv:
0000000000101750	pushq	%rbp
0000000000101751	movq	%rsp, %rbp
0000000000101754	pushq	%r15
0000000000101756	pushq	%r14
0000000000101758	pushq	%rbx
0000000000101759	pushq	%rax
000000000010175a	movq	%rdi, %rbx
000000000010175d	leaq	_theApp(%rip), %rax
0000000000101764	movq	(%rax), %rdi
0000000000101767	callq	__ZN13OZApplication13getCurrentDocEv ## OZApplication::getCurrentDoc()
000000000010176c	testq	%rax, %rax
000000000010176f	je	0x1017a6
0000000000101771	movq	%rax, %r14
0000000000101774	movq	%rax, %rdi
0000000000101777	callq	__ZNK10OZDocument24getOverrideFCPColorSpaceEv ## OZDocument::getOverrideFCPColorSpace() const
000000000010177c	movl	%eax, %r15d
000000000010177f	movzbl	0x8(%rbx), %esi
0000000000101783	movq	%r14, %rdi
0000000000101786	callq	__ZN10OZDocument24setOverrideFCPColorSpaceEb ## OZDocument::setOverrideFCPColorSpace(bool)
000000000010178b	movb	%r15b, 0x8(%rbx)
000000000010178f	movq	%r14, %rdi
0000000000101792	movl	$0x1010, %esi                   ## imm = 0x1010
0000000000101797	addq	$0x8, %rsp
000000000010179b	popq	%rbx
000000000010179c	popq	%r14
000000000010179e	popq	%r15
00000000001017a0	popq	%rbp
00000000001017a1	jmp	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
00000000001017a6	addq	$0x8, %rsp
00000000001017aa	popq	%rbx
00000000001017ab	popq	%r14
00000000001017ad	popq	%r15
00000000001017af	popq	%rbp
00000000001017b0	retq
00000000001017b1	nopw	%cs:(%rax,%rax)
