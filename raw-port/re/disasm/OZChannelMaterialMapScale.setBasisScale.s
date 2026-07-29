__ZN25OZChannelMaterialMapScale13setBasisScaleEdd:
00000000002835c0	pushq	%rbp
00000000002835c1	movq	%rsp, %rbp
00000000002835c4	pushq	%rbx
00000000002835c5	subq	$0x18, %rsp
00000000002835c9	movsd	%xmm1, -0x18(%rbp)
00000000002835ce	movsd	%xmm0, -0x10(%rbp)
00000000002835d3	movq	%rdi, %rbx
00000000002835d6	addq	$0x2e8, %rbx                    ## imm = 0x2E8
00000000002835dd	movq	%rbx, %rdi
00000000002835e0	xorl	%esi, %esi
00000000002835e2	callq	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
00000000002835e7	movq	0x5a0f22(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000002835ee	movq	%rbx, %rdi
00000000002835f1	movsd	-0x10(%rbp), %xmm0
00000000002835f6	movsd	-0x18(%rbp), %xmm1
00000000002835fb	xorl	%edx, %edx
00000000002835fd	addq	$0x18, %rsp
0000000000283601	popq	%rbx
0000000000283602	popq	%rbp
0000000000283603	jmp	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
0000000000283608	nopl	(%rax,%rax)
