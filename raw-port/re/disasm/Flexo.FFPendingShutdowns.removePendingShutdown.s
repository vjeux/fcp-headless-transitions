__ZN18FFPendingShutdowns21removePendingShutdownEP8NSString:
0000000000d763d0	pushq	%rbp
0000000000d763d1	movq	%rsp, %rbp
0000000000d763d4	pushq	%r15
0000000000d763d6	pushq	%r14
0000000000d763d8	pushq	%r12
0000000000d763da	pushq	%rbx
0000000000d763db	movq	%rsi, %r14
0000000000d763de	movq	%rdi, %r15
0000000000d763e1	leaq	_OBJC_CLASS_$_FFPlayer(%rip), %rdi
0000000000d763e8	callq	0x149798c                       ## symbol stub for: _objc_opt_class
0000000000d763ed	movq	%rax, %rbx
0000000000d763f0	movq	%rax, %rdi
0000000000d763f3	callq	0x14979e6                       ## symbol stub for: _objc_sync_enter
0000000000d763f8	movq	(%r15), %rdi
0000000000d763fb	movq	0xe42d56(%rip), %rsi
0000000000d76402	movq	%r14, %rdx
0000000000d76405	callq	*0xb772b5(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d7640b	testq	%rax, %rax
0000000000d7640e	je	0xd76433
0000000000d76410	movq	(%r15), %rdi
0000000000d76413	movq	0xe42d76(%rip), %rsi
0000000000d7641a	movq	%r14, %rdx
0000000000d7641d	callq	*0xb7729d(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d76423	movq	%rbx, %rdi
0000000000d76426	popq	%rbx
0000000000d76427	popq	%r12
0000000000d76429	popq	%r14
0000000000d7642b	popq	%r15
0000000000d7642d	popq	%rbp
0000000000d7642e	jmp	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d76433	movq	0xb76f56(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAssertionHandler
0000000000d7643a	movq	0xe433e7(%rip), %rsi
0000000000d76441	callq	*0xb77279(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d76447	movq	%rax, %r12
0000000000d7644a	movq	0xb77117(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
0000000000d76451	movq	0xe4d918(%rip), %rsi
0000000000d76458	leaq	0x8e7e99(%rip), %rdx            ## literal pool for: "void FFPendingShutdowns::removePendingShutdown(NSString *)"
0000000000d7645f	callq	*0xb7725b(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d76465	movq	0xe50374(%rip), %rsi
0000000000d7646c	leaq	0xc378b5(%rip), %rcx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d76473	leaq	0xc383ee(%rip), %r9             ## Objc cfstring ref: @"bad cfstring ref"
0000000000d7647a	movl	$0x591, %r8d                    ## imm = 0x591
0000000000d76480	movq	%r12, %rdi
0000000000d76483	movq	%rax, %rdx
0000000000d76486	xorl	%eax, %eax
0000000000d76488	callq	*0xb77232(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d7648e	jmp	0xd76410
0000000000d76490	movq	%rax, %r14
0000000000d76493	movq	%rbx, %rdi
0000000000d76496	callq	0x14979ec                       ## symbol stub for: _objc_sync_exit
0000000000d7649b	movq	%r14, %rdi
0000000000d7649e	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d764a3	nopw	%cs:(%rax,%rax)
