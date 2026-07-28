__ZN17HGBilateralFilterC1Ev:
00000000001c87d0	pushq	%rbp
00000000001c87d1	movq	%rsp, %rbp
00000000001c87d4	pushq	%rbx
00000000001c87d5	pushq	%rax
00000000001c87d6	movq	%rdi, %rbx
00000000001c87d9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001c87de	leaq	0x86100b(%rip), %rax
00000000001c87e5	movq	%rax, (%rbx)
00000000001c87e8	xorps	%xmm0, %xmm0
00000000001c87eb	movups	%xmm0, 0x198(%rbx)
00000000001c87f2	movsd	0x2018b6(%rip), %xmm0
00000000001c87fa	movsd	%xmm0, 0x1a8(%rbx)
00000000001c8802	movl	$0x40400000, 0x1b0(%rbx)        ## imm = 0x40400000
00000000001c880c	addq	$0x8, %rsp
00000000001c8810	popq	%rbx
00000000001c8811	popq	%rbp
00000000001c8812	retq
00000000001c8813	nopw	%cs:(%rax,%rax)
