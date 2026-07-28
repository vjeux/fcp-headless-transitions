__ZN16HgcMultiplyAlpha6GetROIEP10HGRendereri6HGRect:
00000000014691d0	movq	%rcx, %rax
00000000014691d3	cmpl	$0x2, %edx
00000000014691d6	jb	0x14691eb
00000000014691d8	pushq	%rbp
00000000014691d9	movq	%rsp, %rbp
00000000014691dc	movq	0x48108d(%rip), %rcx            ## literal pool symbol address: _HGRectNull
00000000014691e3	movq	(%rcx), %rax
00000000014691e6	movq	0x8(%rcx), %r8
00000000014691ea	popq	%rbp
00000000014691eb	movq	%r8, %rdx
00000000014691ee	retq
00000000014691ef	nop
