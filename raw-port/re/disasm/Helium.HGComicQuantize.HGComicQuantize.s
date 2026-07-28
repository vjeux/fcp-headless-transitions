__ZN15HGComicQuantizeC1Ev:
00000000000073d0	pushq	%rbp
00000000000073d1	movq	%rsp, %rbp
00000000000073d4	pushq	%rbx
00000000000073d5	pushq	%rax
00000000000073d6	movq	%rdi, %rbx
00000000000073d9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000073de	leaq	0x9fc1a3(%rip), %rax
00000000000073e5	movq	%rax, (%rbx)
00000000000073e8	movsd	0x3c08c0(%rip), %xmm0
00000000000073f0	movsd	%xmm0, 0x198(%rbx)
00000000000073f8	orl	$0x620, 0x10(%rbx)              ## imm = 0x620
00000000000073ff	addq	$0x8, %rsp
0000000000007403	popq	%rbx
0000000000007404	popq	%rbp
0000000000007405	retq
0000000000007406	nopw	%cs:(%rax,%rax)
