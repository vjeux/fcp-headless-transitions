__ZN28HGLensDistort_distort_kernel11_distortROIE6HGRect:
000000000022b840	pushq	%rbp
000000000022b841	movq	%rsp, %rbp
000000000022b844	subq	$0x10, %rsp
000000000022b848	movq	%rsi, -0x10(%rbp)
000000000022b84c	movq	%rdx, -0x8(%rbp)
000000000022b850	addq	$0x1a8, %rdi                    ## imm = 0x1A8
000000000022b857	leaq	__ZN10LensParams7distortERK3Pt2(%rip), %rsi ## LensParams::distort(Pt2 const&)
000000000022b85e	leaq	-0x10(%rbp), %rcx
000000000022b862	xorl	%edx, %edx
000000000022b864	callq	__ZN10LensParams12_processRectEMS_F3Pt2RKS0_ERK6HGRect ## LensParams::_processRect(Pt2 (LensParams::*)(Pt2 const&), HGRect const&)
000000000022b869	addq	$0x10, %rsp
000000000022b86d	popq	%rbp
000000000022b86e	retq
000000000022b86f	nop
