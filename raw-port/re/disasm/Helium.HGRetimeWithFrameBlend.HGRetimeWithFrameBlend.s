__ZN22HGRetimeWithFrameBlendC1Ev:
00000000001e3860	pushq	%rbp
00000000001e3861	movq	%rsp, %rbp
00000000001e3864	pushq	%rbx
00000000001e3865	pushq	%rax
00000000001e3866	movq	%rdi, %rbx
00000000001e3869	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001e386e	leaq	0x847d53(%rip), %rax
00000000001e3875	movq	%rax, (%rbx)
00000000001e3878	movq	$0x0, 0x1a0(%rbx)
00000000001e3883	movl	$0x0, 0x198(%rbx)
00000000001e388d	addq	$0x8, %rsp
00000000001e3891	popq	%rbx
00000000001e3892	popq	%rbp
00000000001e3893	retq
00000000001e3894	nopw	%cs:(%rax,%rax)
