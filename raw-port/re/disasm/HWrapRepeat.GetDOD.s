__ZN11HWrapRepeat6GetDODEP10HGRendereri6HGRect:
0000000000470760	testl	%edx, %edx
0000000000470762	je	0x470773
0000000000470764	movq	0x3b05b5(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000047076b	movq	(%rcx), %rax
000000000047076e	movq	0x8(%rcx), %rdx
0000000000470772	retq
0000000000470773	pushq	%rbp
0000000000470774	movq	%rsp, %rbp
0000000000470777	movq	%rcx, %rdi
000000000047077a	movq	%r8, %rsi
000000000047077d	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000470782	movq	0x3b0567(%rip), %rcx            ## literal pool symbol address: _HGRectInfinite
0000000000470789	movq	0x3b0590(%rip), %rdx            ## literal pool symbol address: _HGRectNull
0000000000470790	leaq	0x8(%rcx), %rsi
0000000000470794	leaq	0x8(%rdx), %rdi
0000000000470798	testl	%eax, %eax
000000000047079a	cmoveq	%rcx, %rdx
000000000047079e	movq	(%rdx), %rax
00000000004707a1	cmoveq	%rsi, %rdi
00000000004707a5	movq	(%rdi), %rdx
00000000004707a8	popq	%rbp
00000000004707a9	retq
00000000004707aa	nopw	(%rax,%rax)
