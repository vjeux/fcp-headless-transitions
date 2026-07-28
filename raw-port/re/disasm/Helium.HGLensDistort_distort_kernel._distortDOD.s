__ZN28HGLensDistort_distort_kernel11_distortDODE6HGRect:
000000000022b870	pushq	%rbp
000000000022b871	movq	%rsp, %rbp
000000000022b874	subq	$0x10, %rsp
000000000022b878	movq	%rsi, -0x10(%rbp)
000000000022b87c	movq	%rdx, -0x8(%rbp)
000000000022b880	addq	$0x1a8, %rdi                    ## imm = 0x1A8
000000000022b887	leaq	__ZN10LensParams9undistortERK3Pt2(%rip), %rsi ## LensParams::undistort(Pt2 const&)
000000000022b88e	leaq	-0x10(%rbp), %rcx
000000000022b892	xorl	%edx, %edx
000000000022b894	callq	__ZN10LensParams12_processRectEMS_F3Pt2RKS0_ERK6HGRect ## LensParams::_processRect(Pt2 (LensParams::*)(Pt2 const&), HGRect const&)
000000000022b899	addq	$0x10, %rsp
000000000022b89d	popq	%rbp
000000000022b89e	retq
000000000022b89f	nop
