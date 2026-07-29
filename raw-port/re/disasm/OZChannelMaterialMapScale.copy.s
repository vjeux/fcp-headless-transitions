__ZN25OZChannelMaterialMapScale4copyEPK13OZChannelBaseb:
0000000000283520	pushq	%rbp
0000000000283521	movq	%rsp, %rbp
0000000000283524	pushq	%r15
0000000000283526	pushq	%r14
0000000000283528	pushq	%rbx
0000000000283529	pushq	%rax
000000000028352a	movl	%edx, %r14d
000000000028352d	movq	%rsi, %r15
0000000000283530	movq	%rdi, %rbx
0000000000283533	callq	0x6dd560                        ## symbol stub for: __ZN11OZChannel2D4copyEPK13OZChannelBaseb
0000000000283538	testq	%r15, %r15
000000000028353b	je	0x28355a
000000000028353d	movq	0x59f1ec(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000283544	leaq	__ZTI25OZChannelMaterialMapScale(%rip), %rdx ## typeinfo for OZChannelMaterialMapScale
000000000028354b	movq	%r15, %rdi
000000000028354e	xorl	%ecx, %ecx
0000000000283550	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000283555	movq	%rax, %r15
0000000000283558	jmp	0x28355d
000000000028355a	xorl	%r15d, %r15d
000000000028355d	leaq	0x1b8(%rbx), %rdi
0000000000283564	leaq	0x1b8(%r15), %rsi
000000000028356b	movzbl	%r14b, %r14d
000000000028356f	movl	%r14d, %edx
0000000000283572	callq	0x6df426                        ## symbol stub for: __ZN9OZChannel4copyEPK13OZChannelBaseb
0000000000283577	leaq	0x250(%rbx), %rdi
000000000028357e	leaq	0x250(%r15), %rsi
0000000000283585	movl	%r14d, %edx
0000000000283588	callq	0x6df426                        ## symbol stub for: __ZN9OZChannel4copyEPK13OZChannelBaseb
000000000028358d	addq	$0x2e8, %rbx                    ## imm = 0x2E8
0000000000283594	addq	$0x2e8, %r15                    ## imm = 0x2E8
000000000028359b	movq	%rbx, %rdi
000000000028359e	movq	%r15, %rsi
00000000002835a1	movl	%r14d, %edx
00000000002835a4	addq	$0x8, %rsp
00000000002835a8	popq	%rbx
00000000002835a9	popq	%r14
00000000002835ab	popq	%r15
00000000002835ad	popq	%rbp
00000000002835ae	jmp	0x6dd560                        ## symbol stub for: __ZN11OZChannel2D4copyEPK13OZChannelBaseb
00000000002835b3	nopw	%cs:(%rax,%rax)
