__ZN16OZRotoshapeStyle16calcHashForStateER23PCSerializerWriteStreamRK14OZRenderParamsRNSt3__14listIP19OZObjectManipulatorNS5_9allocatorIS8_EEEE:
0000000000527ae0	pushq	%rbp
0000000000527ae1	movq	%rsp, %rbp
0000000000527ae4	movq	%rsi, %rdi
0000000000527ae7	movq	0x2ff49a(%rip), %rsi            ## literal pool symbol address: __ZTI23PCSerializerWriteStream
0000000000527aee	movq	0x2fbc5b(%rip), %rdx            ## literal pool symbol address: __ZTI17PCHashWriteStream
0000000000527af5	xorl	%ecx, %ecx
0000000000527af7	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000527afc	testq	%rax, %rax
0000000000527aff	je	0x527b0b
0000000000527b01	movq	(%rax), %rcx
0000000000527b04	movq	%rax, %rdi
0000000000527b07	popq	%rbp
0000000000527b08	jmpq	*0x28(%rcx)
0000000000527b0b	callq	0x6dfccc                        ## symbol stub for: ___cxa_bad_cast
