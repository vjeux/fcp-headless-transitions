__ZN14MotionROIFrame3getEv:
0000000000147dd0	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000147dd7	testq	%rax, %rax
0000000000147dda	je	0x147ddd
0000000000147ddc	retq
0000000000147ddd	pushq	%rbp
0000000000147dde	movq	%rsp, %rbp
0000000000147de1	movl	$0x4, %edi
0000000000147de6	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000147deb	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000147df1	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000147df8	popq	%rbp
0000000000147df9	retq
0000000000147dfa	nopw	(%rax,%rax)
