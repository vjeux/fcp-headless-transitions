__ZN16HgcSubtractAlpha6GetROIEP10HGRendereri6HGRect:
000000000146e800	movq	%rcx, %rax
000000000146e803	cmpl	$0x2, %edx
000000000146e806	jb	0x146e81b
000000000146e808	pushq	%rbp
000000000146e809	movq	%rsp, %rbp
000000000146e80c	movq	0x47ba5d(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000146e813	movq	(%rcx), %rax
000000000146e816	movq	0x8(%rcx), %r8
000000000146e81a	popq	%rbp
000000000146e81b	movq	%r8, %rdx
000000000146e81e	retq
000000000146e81f	nop
