__ZN20OZHackedPMRAutoTimerD1Ev:
000000000061bf30	pushq	%rbp
000000000061bf31	movq	%rsp, %rbp
000000000061bf34	pushq	%rbx
000000000061bf35	pushq	%rax
000000000061bf36	movq	(%rdi), %rbx
000000000061bf39	testq	%rbx, %rbx
000000000061bf3c	je	0x61bf54
000000000061bf3e	movq	%rbx, %rdi
000000000061bf41	callq	0x6de5f8                        ## symbol stub for: __ZN20FFPMRFunnelAutoTimerD1Ev
000000000061bf46	movq	%rbx, %rdi
000000000061bf49	addq	$0x8, %rsp
000000000061bf4d	popq	%rbx
000000000061bf4e	popq	%rbp
000000000061bf4f	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000061bf54	addq	$0x8, %rsp
000000000061bf58	popq	%rbx
000000000061bf59	popq	%rbp
000000000061bf5a	retq
000000000061bf5b	addb	%al, (%rax)
000000000061bf5d	addb	%al, (%rax)
000000000061bf5f	addb	%dl, 0x48(%rbp)
000000000061bf62	movl	%esp, %ebp
000000000061bf64	pushq	%r14
000000000061bf66	pushq	%rbx
000000000061bf67	movq	%rdi, %rbx
000000000061bf6a	callq	0x6dd506                        ## symbol stub for: __ZN11HGRenderJobC2Ev
000000000061bf6f	leaq	0x2690ca(%rip), %rax
000000000061bf76	movq	%rax, (%rbx)
000000000061bf79	leaq	__ZL27OZHGRenderJobBaseNotifyFuncP11HGRenderJob(%rip), %rsi ## OZHGRenderJobBaseNotifyFunc(HGRenderJob*)
000000000061bf80	movq	%rbx, %rdi
000000000061bf83	callq	0x6dd4c4                        ## symbol stub for: __ZN11HGRenderJob13SetNotifyFuncEPFvPS_E
000000000061bf88	movq	%rbx, %rdi
000000000061bf8b	movl	$0x2, %esi
000000000061bf90	callq	0x6dd4d6                        ## symbol stub for: __ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE
000000000061bf95	popq	%rbx
000000000061bf96	popq	%r14
000000000061bf98	popq	%rbp
000000000061bf99	retq
000000000061bf9a	movq	%rax, %r14
000000000061bf9d	movq	%rbx, %rdi
000000000061bfa0	callq	0x6dd50c                        ## symbol stub for: __ZN11HGRenderJobD2Ev
000000000061bfa5	movq	%r14, %rdi
000000000061bfa8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000061bfad	nopl	(%rax)
