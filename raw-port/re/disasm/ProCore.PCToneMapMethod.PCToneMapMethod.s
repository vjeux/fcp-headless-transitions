__ZN15PCToneMapMethodC1Ev:
000000000006bc9c	pushq	%rbp
000000000006bc9d	movq	%rsp, %rbp
000000000006bca0	pushq	%rbx
000000000006bca1	pushq	%rax
000000000006bca2	movq	%rdi, %rbx
000000000006bca5	callq	__ZN11PCColorUtil21getWhiteGainForHLG_75Ev ## PCColorUtil::getWhiteGainForHLG_75()
000000000006bcaa	movl	$0x5, (%rbx)
000000000006bcb0	movss	%xmm0, 0x4(%rbx)
000000000006bcb5	addq	$0x8, %rsp
000000000006bcb9	popq	%rbx
000000000006bcba	popq	%rbp
000000000006bcbb	retq
