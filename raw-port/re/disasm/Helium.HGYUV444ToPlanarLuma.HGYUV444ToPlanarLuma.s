__ZN20HGYUV444ToPlanarLumaC1ENS_12LumaPerPixelE:
00000000000e5aa0	pushq	%rbp
00000000000e5aa1	movq	%rsp, %rbp
00000000000e5aa4	pushq	%r14
00000000000e5aa6	pushq	%rbx
00000000000e5aa7	movl	%esi, %ebx
00000000000e5aa9	movq	%rdi, %r14
00000000000e5aac	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000e5ab1	leaq	0x928ba0(%rip), %rax
00000000000e5ab8	movq	%rax, (%r14)
00000000000e5abb	movq	$0x0, 0x198(%r14)
00000000000e5ac6	movl	%ebx, 0x1a0(%r14)
00000000000e5acd	popq	%rbx
00000000000e5ace	popq	%r14
00000000000e5ad0	popq	%rbp
00000000000e5ad1	retq
00000000000e5ad2	nopw	%cs:(%rax,%rax)
