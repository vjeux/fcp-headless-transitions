__ZN11HWrapMirror6GetDODEP10HGRendereri6HGRect:
0000000000470cb0	testl	%edx, %edx
0000000000470cb2	je	0x470cc3
0000000000470cb4	movq	0x3b0065(%rip), %rcx            ## literal pool symbol address: _HGRectNull
0000000000470cbb	movq	(%rcx), %rax
0000000000470cbe	movq	0x8(%rcx), %rdx
0000000000470cc2	retq
0000000000470cc3	pushq	%rbp
0000000000470cc4	movq	%rsp, %rbp
0000000000470cc7	movq	%rcx, %rdi
0000000000470cca	movq	%r8, %rsi
0000000000470ccd	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000470cd2	movq	0x3b0017(%rip), %rcx            ## literal pool symbol address: _HGRectInfinite
0000000000470cd9	movq	0x3b0040(%rip), %rdx            ## literal pool symbol address: _HGRectNull
0000000000470ce0	leaq	0x8(%rcx), %rsi
0000000000470ce4	leaq	0x8(%rdx), %rdi
0000000000470ce8	testl	%eax, %eax
0000000000470cea	cmoveq	%rcx, %rdx
0000000000470cee	movq	(%rdx), %rax
0000000000470cf1	cmoveq	%rsi, %rdi
0000000000470cf5	movq	(%rdi), %rdx
0000000000470cf8	popq	%rbp
0000000000470cf9	retq
0000000000470cfa	nopw	(%rax,%rax)
