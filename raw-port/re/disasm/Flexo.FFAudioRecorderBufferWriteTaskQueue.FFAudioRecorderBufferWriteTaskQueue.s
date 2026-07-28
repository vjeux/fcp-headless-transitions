__ZN35FFAudioRecorderBufferWriteTaskQueueC1Ev:
0000000000d30dd0	pushq	%rbp
0000000000d30dd1	movq	%rsp, %rbp
0000000000d30dd4	pushq	%r14
0000000000d30dd6	pushq	%rbx
0000000000d30dd7	movq	%rdi, %rbx
0000000000d30dda	xorl	%esi, %esi
0000000000d30ddc	callq	__ZN19FFLocklessQueueBaseC2E25FFLocklessQueueSortOption ## FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption)
0000000000d30de1	leaq	0xbe1c20(%rip), %rax
0000000000d30de8	movq	%rax, (%rbx)
0000000000d30deb	leaq	__ZL47FFAudioRecorderBufferWriteTaskQueue_FreeElementPvPN19FFLocklessQueueBase11ElementBaseE(%rip), %rsi ## FFAudioRecorderBufferWriteTaskQueue_FreeElement(void*, FFLocklessQueueBase::ElementBase*)
0000000000d30df2	movq	%rbx, %rdi
0000000000d30df5	xorl	%edx, %edx
0000000000d30df7	callq	__ZN19FFLocklessQueueBase18setFreeElementProcEPFvPvPNS_11ElementBaseEES0_ ## FFLocklessQueueBase::setFreeElementProc(void (*)(void*, FFLocklessQueueBase::ElementBase*), void*)
0000000000d30dfc	popq	%rbx
0000000000d30dfd	popq	%r14
0000000000d30dff	popq	%rbp
0000000000d30e00	retq
0000000000d30e01	movq	%rax, %r14
0000000000d30e04	movq	%rbx, %rdi
0000000000d30e07	callq	__ZN15FFLocklessQueueIP30FFAudioRecorderBufferWriteTaskED2Ev ## FFLocklessQueue<FFAudioRecorderBufferWriteTask*>::~FFLocklessQueue()
0000000000d30e0c	movq	%r14, %rdi
0000000000d30e0f	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d30e14	nopw	%cs:(%rax,%rax)
