__ZN13HGCSolidColor6GetDODEP10HGRendereri6HGRect:
000000000011b330	pushq	%rbp
000000000011b331	movq	%rsp, %rbp
000000000011b334	leaq	0x1a0(%rdi), %rax
000000000011b33b	addq	$0x1a8, %rdi                    ## imm = 0x1A8
000000000011b342	leaq	_HGRectNull(%rip), %rcx
000000000011b349	leaq	0x8(%rcx), %rsi
000000000011b34d	testl	%edx, %edx
000000000011b34f	cmovneq	%rcx, %rax
000000000011b353	cmoveq	%rdi, %rsi
000000000011b357	movq	(%rsi), %rdx
000000000011b35a	movq	(%rax), %rax
000000000011b35d	popq	%rbp
000000000011b35e	retq
000000000011b35f	nop
