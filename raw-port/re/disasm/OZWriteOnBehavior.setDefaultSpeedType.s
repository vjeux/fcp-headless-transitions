__ZN17OZWriteOnBehavior19setDefaultSpeedTypeEj:
0000000000477230	pushq	%rbp
0000000000477231	movq	%rsp, %rbp
0000000000477234	pushq	%rbx
0000000000477235	pushq	%rax
0000000000477236	movq	%rdi, %rbx
0000000000477239	addq	$0x540, %rbx                    ## imm = 0x540
0000000000477240	movl	%esi, %eax
0000000000477242	cvtsi2sd	%rax, %xmm0
0000000000477247	movq	%rbx, %rdi
000000000047724a	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
000000000047724f	movq	%rbx, %rdi
0000000000477252	xorl	%esi, %esi
0000000000477254	addq	$0x8, %rsp
0000000000477258	popq	%rbx
0000000000477259	popq	%rbp
000000000047725a	jmp	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
000000000047725f	nop
