__ZN17HgcScreeningMatte6GetROIEP10HGRendereri6HGRect:
000000000146d0d0	movq	%rcx, %rax
000000000146d0d3	cmpl	$0x2, %edx
000000000146d0d6	jb	0x146d0eb
000000000146d0d8	pushq	%rbp
000000000146d0d9	movq	%rsp, %rbp
000000000146d0dc	movq	0x47d18d(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000146d0e3	movq	(%rcx), %rax
000000000146d0e6	movq	0x8(%rcx), %r8
000000000146d0ea	popq	%rbp
000000000146d0eb	movq	%r8, %rdx
000000000146d0ee	retq
000000000146d0ef	nop
