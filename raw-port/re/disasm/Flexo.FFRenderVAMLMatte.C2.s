__ZN17FFRenderVAMLMatteC2EP21VAMLBackgroundMatting:
0000000000687eb0	pushq	%rbp
0000000000687eb1	movq	%rsp, %rbp
0000000000687eb4	pushq	%r15
0000000000687eb6	pushq	%r14
0000000000687eb8	pushq	%rbx
0000000000687eb9	pushq	%rax
0000000000687eba	movq	%rsi, %r14
0000000000687ebd	movq	%rdi, %rbx
0000000000687ec0	callq	0x1496c06                       ## symbol stub for: __ZN6HGNodeC2Ev
0000000000687ec5	leaq	0x1279bcc(%rip), %rax
0000000000687ecc	movq	%rax, (%rbx)
0000000000687ecf	xorps	%xmm0, %xmm0
0000000000687ed2	movaps	%xmm0, 0x1c0(%rbx)
0000000000687ed9	movq	%rbx, %rdi
0000000000687edc	movl	$0x1, %esi
0000000000687ee1	callq	0x1496be2                       ## symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
0000000000687ee6	movq	%r14, %rdi
0000000000687ee9	callq	*0x1265821(%rip)                ## literal pool symbol address: _objc_retain
0000000000687eef	movq	%rax, 0x1c0(%rbx)
0000000000687ef6	leaq	0x1b0(%rbx), %rdi
0000000000687efd	xorl	%esi, %esi
0000000000687eff	xorl	%edx, %edx
0000000000687f01	xorl	%ecx, %ecx
0000000000687f03	xorl	%r8d, %r8d
0000000000687f06	callq	0x1496c12                       ## symbol stub for: __ZN6HGRect4InitEiiii
0000000000687f0b	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000687f10	callq	0x1496d92                       ## symbol stub for: __ZN8HGObjectnwEm
0000000000687f15	movq	%rax, %r14
0000000000687f18	leaq	0x1c0(%rbx), %rax
0000000000687f1f	movq	(%rax), %rsi
0000000000687f22	movq	%r14, %rdi
0000000000687f25	callq	__ZN11FFVAMLMatteC1EP21VAMLBackgroundMatting ## FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*)
0000000000687f2a	movq	0x1c8(%rbx), %rdi
0000000000687f31	cmpq	%r14, %rdi
0000000000687f34	je	0x687f4a
0000000000687f36	testq	%rdi, %rdi
0000000000687f39	je	0x687f41
0000000000687f3b	movq	(%rdi), %rax
0000000000687f3e	callq	*0x18(%rax)
0000000000687f41	movq	%r14, 0x1c8(%rbx)
0000000000687f48	jmp	0x687f58
0000000000687f4a	testq	%r14, %r14
0000000000687f4d	je	0x687f58
0000000000687f4f	movq	(%r14), %rax
0000000000687f52	movq	%r14, %rdi
0000000000687f55	callq	*0x18(%rax)
0000000000687f58	addq	$0x8, %rsp
0000000000687f5c	popq	%rbx
0000000000687f5d	popq	%r14
0000000000687f5f	popq	%r15
0000000000687f61	popq	%rbp
0000000000687f62	retq
0000000000687f63	movq	%rax, %rdi
0000000000687f66	callq	___clang_call_terminate
0000000000687f6b	movq	%rax, %r15
0000000000687f6e	testq	%r14, %r14
0000000000687f71	je	0x687f98
0000000000687f73	movq	(%r14), %rax
0000000000687f76	movq	%r14, %rdi
0000000000687f79	callq	*0x18(%rax)
0000000000687f7c	jmp	0x687f98
0000000000687f7e	movq	%rax, %rdi
0000000000687f81	callq	___clang_call_terminate
0000000000687f86	movq	%rax, %r15
0000000000687f89	movq	%r14, %rdi
0000000000687f8c	callq	0x1496d8c                       ## symbol stub for: __ZN8HGObjectdlEPv
0000000000687f91	jmp	0x687f98
0000000000687f93	jmp	0x687f95
0000000000687f95	movq	%rax, %r15
0000000000687f98	movq	0x1c8(%rbx), %rdi
0000000000687f9f	testq	%rdi, %rdi
0000000000687fa2	je	0x687faa
0000000000687fa4	movq	(%rdi), %rax
0000000000687fa7	callq	*0x18(%rax)
0000000000687faa	movq	%rbx, %rdi
0000000000687fad	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
0000000000687fb2	movq	%r15, %rdi
0000000000687fb5	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000687fba	movq	%rax, %rdi
0000000000687fbd	callq	___clang_call_terminate
0000000000687fc2	nopw	%cs:(%rax,%rax)
