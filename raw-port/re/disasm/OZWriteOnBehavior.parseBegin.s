__ZN17OZWriteOnBehavior10parseBeginER22PCSerializerReadStream:
0000000000477330	pushq	%rbp
0000000000477331	movq	%rsp, %rbp
0000000000477334	pushq	%r14
0000000000477336	pushq	%rbx
0000000000477337	movq	%rsi, %rbx
000000000047733a	movq	%rdi, %r14
000000000047733d	addq	$0x640, %rdi                    ## imm = 0x640
0000000000477344	xorl	%esi, %esi
0000000000477346	callq	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
000000000047734b	cmpl	$0x4, 0x68(%rbx)
000000000047734f	ja	0x47736e
0000000000477351	leaq	0x770(%r14), %rdi
0000000000477358	movq	0x3ad1b1(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000047735f	movsd	0x28e079(%rip), %xmm0
0000000000477367	xorl	%edx, %edx
0000000000477369	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
000000000047736e	movq	%r14, %rdi
0000000000477371	movq	%rbx, %rsi
0000000000477374	popq	%rbx
0000000000477375	popq	%r14
0000000000477377	popq	%rbp
0000000000477378	jmp	__ZN10OZBehavior10parseBeginER22PCSerializerReadStream ## OZBehavior::parseBegin(PCSerializerReadStream&)
000000000047737d	nopl	(%rax)
