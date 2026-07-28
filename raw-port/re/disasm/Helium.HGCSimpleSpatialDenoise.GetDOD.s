__ZN23HGCSimpleSpatialDenoise6GetDODEP10HGRendereri6HGRect:
00000000001c8710	movq	%rcx, %rax
00000000001c8713	testl	%edx, %edx
00000000001c8715	je	0x1c872a
00000000001c8717	pushq	%rbp
00000000001c8718	movq	%rsp, %rbp
00000000001c871b	leaq	_HGRectNull(%rip), %rcx
00000000001c8722	movq	(%rcx), %rax
00000000001c8725	movq	0x8(%rcx), %r8
00000000001c8729	popq	%rbp
00000000001c872a	movq	%r8, %rdx
00000000001c872d	retq
00000000001c872e	nop
