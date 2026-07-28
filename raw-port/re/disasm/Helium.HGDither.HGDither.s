__ZN8HGDitherC1Ev:
000000000006f8d0	pushq	%rbp
000000000006f8d1	movq	%rsp, %rbp
000000000006f8d4	pushq	%rbx
000000000006f8d5	pushq	%rax
000000000006f8d6	movq	%rdi, %rbx
000000000006f8d9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000006f8de	leaq	0x999053(%rip), %rax
000000000006f8e5	movq	%rax, (%rbx)
000000000006f8e8	movq	$0x0, 0x198(%rbx)
000000000006f8f3	movb	$0x1, 0x1c0(%rbx)
000000000006f8fa	addq	$0x8, %rsp
000000000006f8fe	popq	%rbx
000000000006f8ff	popq	%rbp
000000000006f900	retq
000000000006f901	nopw	%cs:(%rax,%rax)
