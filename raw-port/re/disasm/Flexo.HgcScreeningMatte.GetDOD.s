__ZN17HgcScreeningMatte6GetDODEP10HGRendereri6HGRect:
000000000146d0b0	movq	%rcx, %rax
000000000146d0b3	cmpl	$0x2, %edx
000000000146d0b6	jb	0x146d0cb
000000000146d0b8	pushq	%rbp
000000000146d0b9	movq	%rsp, %rbp
000000000146d0bc	movq	0x47d1ad(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000146d0c3	movq	(%rcx), %rax
000000000146d0c6	movq	0x8(%rcx), %r8
000000000146d0ca	popq	%rbp
000000000146d0cb	movq	%r8, %rdx
000000000146d0ce	retq
000000000146d0cf	nop
