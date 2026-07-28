__ZN25OZHeSoftGradientGenerator6GetDODEP10HGRendereri6HGRect:
00000000004dafb0	pushq	%rbp
00000000004dafb1	movq	%rsp, %rbp
00000000004dafb4	leaq	0x1a0(%rdi), %rax
00000000004dafbb	addq	$0x1a8, %rdi                    ## imm = 0x1A8
00000000004dafc2	movq	0x345d57(%rip), %rcx            ## literal pool symbol address: _HGRectNull
00000000004dafc9	leaq	0x8(%rcx), %rsi
00000000004dafcd	testl	%edx, %edx
00000000004dafcf	cmovneq	%rcx, %rax
00000000004dafd3	cmoveq	%rdi, %rsi
00000000004dafd7	movq	(%rsi), %rdx
00000000004dafda	movq	(%rax), %rax
00000000004dafdd	popq	%rbp
00000000004dafde	retq
00000000004dafdf	nop
