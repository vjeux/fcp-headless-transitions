__ZN16OZRotoshapeStyle14calcStaticHashER23PCSerializerWriteStreamRNSt3__14listIP19OZObjectManipulatorNS2_9allocatorIS5_EEEE:
0000000000527a80	pushq	%rbp
0000000000527a81	movq	%rsp, %rbp
0000000000527a84	movq	%rsi, %rdi
0000000000527a87	movq	0x2ff4fa(%rip), %rsi            ## literal pool symbol address: __ZTI23PCSerializerWriteStream
0000000000527a8e	movq	0x2fbcbb(%rip), %rdx            ## literal pool symbol address: __ZTI17PCHashWriteStream
0000000000527a95	xorl	%ecx, %ecx
0000000000527a97	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000527a9c	testq	%rax, %rax
0000000000527a9f	je	0x527aab
0000000000527aa1	movq	(%rax), %rcx
0000000000527aa4	movq	%rax, %rdi
0000000000527aa7	popq	%rbp
0000000000527aa8	jmpq	*0x28(%rcx)
0000000000527aab	callq	0x6dfccc                        ## symbol stub for: ___cxa_bad_cast
