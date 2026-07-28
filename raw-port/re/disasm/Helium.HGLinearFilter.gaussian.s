__ZN14HGLinearFilter8gaussianEfff:
000000000010f110	pushq	%rbp
000000000010f111	movq	%rsp, %rbp
000000000010f114	subq	$0x10, %rsp
000000000010f118	movss	0x2b8ba0(%rip), %xmm3
000000000010f120	divss	%xmm2, %xmm3
000000000010f124	movss	%xmm3, -0x4(%rbp)
000000000010f129	subss	%xmm1, %xmm0
000000000010f12d	mulss	%xmm3, %xmm0
000000000010f131	movss	0x2b8b93(%rip), %xmm1
000000000010f139	mulss	%xmm0, %xmm1
000000000010f13d	mulss	%xmm1, %xmm0
000000000010f141	callq	0x3c50fc                        ## symbol stub for: _expf
000000000010f146	mulss	0x2c323e(%rip), %xmm0
000000000010f14e	mulss	-0x4(%rbp), %xmm0
000000000010f153	addq	$0x10, %rsp
000000000010f157	popq	%rbp
000000000010f158	retq
000000000010f159	nopl	(%rax)
